import { MfCodemirrorView } from '@/editor/codemirror/codemirror'
import { html } from '@codemirror/lang-html'
import { Compartment } from '@codemirror/state'
import type { EditorView as CodeMirrorEditorView } from '@codemirror/view'
import type { EditorView } from '@remirror/pm/view'
import type { Node as ProseNode } from 'prosemirror-model'
import type { NodeView } from 'prosemirror-view'
import type { ProsemirrorNode } from 'remirror'
import { type EditorSchema } from 'remirror'
import { minimalSetup } from '../CodeMirror/setup'
import { LineHtmlBlockExtensionOptions } from './html-block-types'

function removeNewlines(str: string) {
  return str.replace(/\n+|\t/g, '')
}

export class HtmlNodeView implements NodeView {
  // nodeview params
  private _node: ProseNode
  private _outerView: EditorView
  private _getPos: () => number

  // nodeview dom
  dom: HTMLElement
  private _htmlRenderElt: HTMLElement | undefined
  private _htmlSrcElt: HTMLElement | null = null
  private _innerView: CodeMirrorEditorView | undefined
  private readonly schema: EditorSchema
  private readonly languageConf: Compartment
  mfCodemirrorView?: MfCodemirrorView
  destroying = false
  options?: LineHtmlBlockExtensionOptions

  constructor(
    node: ProseNode,
    view: EditorView,
    getPos: () => number,
    options?: LineHtmlBlockExtensionOptions,
  ) {
    // store arguments
    this._node = node
    this._outerView = view
    this._getPos = getPos
    this.schema = node.type.schema
    this.options = options

    // create dom representation of nodeview
    this.dom = document.createElement('div')
    this.dom.classList.add('html-node')

    this._htmlRenderElt = document.createElement('p')
    this._htmlRenderElt.textContent = ''
    this._htmlRenderElt.classList.add('html-node-render')

    const label = document.createElement('span')
    label.innerHTML = `<i class="ri-expand-left-right-line"></i> HTML`
    label.classList.add('html-node-label')

    this.dom.appendChild(label)

    this.dom.appendChild(this._htmlRenderElt)

    this._htmlSrcElt = document.createElement('span')
    this._htmlSrcElt.classList.add('html-src', 'node-hide')

    this.languageConf = new Compartment()

    this.dom.appendChild(this._htmlSrcElt)

    label.addEventListener('click', () => this.ensureFocus())
    this.dom.addEventListener('mouseenter', this.handleMouseEnter)
    this.dom.addEventListener('mouseleave', this.handleMouseLeave)

    this.renderHtml()
  }

  /**
   * Ensure focus on the inner editor whenever this node has focus.
   * This helps to prevent accidental deletions of html blocks.
   */
  ensureFocus() {
    if (this._outerView.hasFocus()) {
      if (this._innerView) {
        this._innerView.focus()
      } else {
        this.openEditor()
      }
    }
  }

  ignoreMutation = () => true

  update(node: ProsemirrorNode): boolean {
    this._node = node
    return !!this.mfCodemirrorView?.update(node)
  }

  // == Events ===================================== //

  selectNode() {
    if (!this.mfCodemirrorView?.updating) {
      this.openEditor()
    }
  }

  deselectNode() {
    if (this.mfCodemirrorView?.updating) {
      this.closeEditor()
    }
  }

  handleMouseEnter = () => {
    this.dom.classList.add('node-enter')
  }

  handleMouseLeave = () => {
    this.dom.classList.remove('node-enter')
  }

  stopEvent(): boolean {
    return true
  }

  // == Rendering ===================================== //

  renderHtml() {
    if (!this._htmlRenderElt) {
      return
    }

    // get tex string to render
    const content = removeNewlines(this.mfCodemirrorView?.content || this._node.textContent)
    const texString = content.trim()

    if (texString.length < 1) {
      while (this._htmlRenderElt.firstChild) {
        this._htmlRenderElt.firstChild.remove()
      }
      return
    } else {
      // ignore
    }

    try {
      while (this._htmlRenderElt.firstChild) {
        this._htmlRenderElt.firstChild.remove()
      }

      this._htmlRenderElt.classList.remove('node-hide')
      this._htmlRenderElt.classList.add('node-show')

      this._htmlRenderElt.innerHTML = texString
    } catch (err) {}
  }

  setSelection(anchor: number, head: number): void {
    if (!this._innerView) {
      this.openEditor()
      this.mfCodemirrorView!.setSelection(anchor, head)
    } else {
      this.mfCodemirrorView?.setSelection(anchor, head)
    }
  }

  openEditor() {
    if (this._innerView) {
      throw Error('inner view should not exist!')
    }

    const htmlLang = html()
    this.mfCodemirrorView = new MfCodemirrorView({
      view: this._outerView,
      node: this._node,
      getPos: this._getPos,
      languageName: 'html',
      extensions: [minimalSetup, htmlLang],
      options: {
        useProsemirrorHistoryKey: true,
        codemirrorEditorViewConfig: {
          parent: this._htmlSrcElt!,
        },
        copyButton: {
          enabled: true,
          customCopyFunction: this.options?.customCopyFunction,
        }
      },
    })

    this._htmlSrcElt!.classList.remove('node-hide')
    this._innerView = this.mfCodemirrorView.cm
    this._htmlRenderElt?.classList.add('node-hide')

    const prevCursorPos: number = this._node.textContent.length || 0

    this.setSelection(prevCursorPos, prevCursorPos)

    this._innerView.focus()

    this._innerView.contentDOM.addEventListener('blur', () => {
      if (this.destroying) return
      this.closeEditor(true)
    })

    this.mfCodemirrorView.forwardSelection()
  }

  destroy() {
    this.destroying = true
    // close the inner editor without rendering
    this.closeEditor(false)
    // clean up dom elements
    if (this._htmlRenderElt) {
      this._htmlRenderElt.remove()
      delete this._htmlRenderElt
    }
    if (this._htmlSrcElt) {
      this._htmlSrcElt.remove()
      this._htmlSrcElt = null // fix for the error
    }

    this.dom.removeEventListener('mouseenter', this.handleMouseEnter)
    this.dom.removeEventListener('mouseleave', this.handleMouseLeave)
    this.dom.remove()
  }

  /**
   * Called when the inner ProseMirror editor should close.
   *
   * @param render Optionally update the rendered html after closing. (which
   *    is generally what we want to do, since the user is done editing!)
   */
  closeEditor(render: boolean = true) {
    if (this._innerView) {
      this._innerView.destroy()
      this._innerView = undefined
    }
    if (this.mfCodemirrorView) {
      this.mfCodemirrorView.destroy()
      this.mfCodemirrorView = undefined
    }

    if (render) {
      this.renderHtml()
    }
  }
}
