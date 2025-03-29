// prosemirror imports
import { Node as ProseNode } from '@remirror/pm/model'
import {
  EditorState,
  Transaction,
  TextSelection,
  PluginKey,
  Command,
  Plugin,
} from '@remirror/pm/state'
import { NodeView, EditorView, Decoration } from '@remirror/pm/view'
import { StepMap } from '@remirror/pm/transform'
import { keymap } from '@remirror/pm/keymap'
import { history, redo, redoDepth, undo, undoDepth } from '@remirror/pm/history'
import { isImageElement } from '@/editor/utils/html'
import { ExtensionsOptions } from '..'

/**
 * A ProseMirror command for determining whether to exit a math block, based on
 * specific conditions.  Normally called when the user has
 *
 * @param outerView The main ProseMirror EditorView containing this math node.
 * @param dir Used to indicate desired cursor position upon closing a math node.
 *     When set to -1, cursor will be placed BEFORE the math node.
 *     When set to +1, cursor will be placed AFTER the math node.
 * @param borderMode An exit condition based on cursor position and direction.
 * @param requireEmptySelection When TRUE, only exit the math node when the
 *    (inner) selection is empty.
 * @returns A new ProseMirror command based on the input configuration.
 */
export function collapseCmd(
  outerView: EditorView,
  dir: 1 | -1,
  requireOnBorder: boolean,
  requireEmptySelection: boolean = true,
): Command {
  // create a new ProseMirror command based on the input conditions
  return (innerState: EditorState, dispatch: ((tr: Transaction) => void) | undefined) => {
    // get selection info
    let outerState: EditorState = outerView.state
    let { to: outerTo, from: outerFrom } = outerState.selection
    let { to: innerTo, from: innerFrom } = innerState.selection

    if (requireEmptySelection && innerTo !== innerFrom) {
      return false
    }
    let currentPos: number = dir > 0 ? innerTo : innerFrom

    if (requireOnBorder) {
      // (subtract two from nodeSize to account for start and end tokens)
      let nodeSize = innerState.doc.nodeSize - 2

      // early return if exit conditions not met
      if (dir > 0 && currentPos < nodeSize) {
        return false
      }
      if (dir < 0 && currentPos > 0) {
        return false
      }
    }

    if (dispatch) {
      // set outer selection to be outside of the nodeview
      let targetPos: number = dir > 0 ? outerTo : outerFrom

      outerView.dispatch(
        outerState.tr.setSelection(TextSelection.create(outerState.doc, targetPos)),
      )

      // must return focus to the outer view, otherwise no cursor will appear
      outerView.focus()
    }

    return true
  }
}


interface IHtmlInlineViewOptions {
  handleViewImgSrcUrl?: ExtensionsOptions['handleViewImgSrcUrl']
}

export class HTMLInlineView implements NodeView {
  // nodeview params
  private _node: ProseNode
  private _outerView: EditorView
  private _getPos: () => number | undefined

  // nodeview dom
  dom: HTMLElement
  private _htmlRenderElt: HTMLElement | undefined
  private _htmlSrcElt: HTMLElement | undefined
  private _innerView: EditorView | undefined

  private _tagName: string
  private _isEditing: boolean

  options: IHtmlInlineViewOptions = {}

  constructor(node: ProseNode, view: EditorView, getPos: () => number | undefined) {
    // store arguments
    this._node = node
    this._outerView = view
    this._getPos = getPos

    // editing state
    this._isEditing = false

    // options
    this._tagName = 'span'

    // create dom representation of nodeview
    this.dom = document.createElement(this._tagName)
    this.dom.classList.add('inline-html')

    this._htmlRenderElt = document.createElement('span')
    this._htmlRenderElt.textContent = ''
    this._htmlRenderElt.classList.add('inline-html-render')
    this.dom.appendChild(this._htmlRenderElt)

    this._htmlSrcElt = document.createElement('span')
    this._htmlSrcElt.spellcheck = false
    this.dom.appendChild(this._htmlSrcElt)

    // ensure
    this.dom.addEventListener('click', () => this.ensureFocus())

    // render initial content

    if (node.attrs.fromInput) {
      setTimeout(() => {
        this.openEditor()
      })
    } else {
      this.renderHtml()
    }
  }

  destroy() {
    // close the inner editor without rendering
    this.closeEditor(false)

    // clean up dom elements
    if (this._htmlRenderElt) {
      this._htmlRenderElt.remove()
      delete this._htmlRenderElt
    }
    if (this._htmlSrcElt) {
      this._htmlSrcElt.remove()
      delete this._htmlSrcElt
    }

    this.dom.remove()
  }

  ensureFocus() {
    if (this._innerView && this._outerView.hasFocus()) {
      this._innerView.focus()
    }
  }

  // == Updates ======================================= //

  update(node: ProseNode, decorations: readonly Decoration[]) {
    if (!node.sameMarkup(this._node)) return false
    this._node = node
    console.log('update', node)

    if (!this._isEditing) {
      this.renderHtml()
    }

    return true
  }

  // == Events ===================================== //

  selectNode() {
    if (!this._outerView.editable) {
      return
    }

    if (!this._isEditing) {
      this.openEditor()
    }
  }

  deselectNode() {
    if (this._isEditing) {
      this.closeEditor()
    }
  }

  stopEvent(event: Event): boolean {
    return (
      this._innerView !== undefined &&
      event.target !== undefined &&
      this._innerView.dom.contains(event.target as Node)
    )
  }

  ignoreMutation() {
    return true
  }

  // == Rendering ===================================== //

  renderHtml(preview = false) {
    if (!this._htmlRenderElt) {
      return
    }

    // get tex string to render
    let content = this._innerView?.state.doc.textContent || this._node.attrs?.htmlText || ''
    let texString = content.trim()

    try {
      while (this._htmlRenderElt.firstChild) {
        this._htmlRenderElt.firstChild.remove()
      }
      const renderEl = document.createElement('span')

      const domParser = new DOMParser()
      const doc = domParser.parseFromString(texString, 'text/html')
      doc.body.childNodes.forEach((child) => {
        if (isImageElement(child) && child.src && this.options.handleViewImgSrcUrl) {
          let targetUrl = child.src

          if (child.src.includes(location.origin)) {
            targetUrl = child.src.split(location.origin)[1]
          }

          this.options.handleViewImgSrcUrl(targetUrl).then((newHref) => {
            child.src = newHref
          })
        }
        renderEl.appendChild(child)
      })

      if (renderEl.childNodes.length === 1) {
        this._htmlRenderElt.remove()
        this._htmlRenderElt = renderEl.firstElementChild as any
      }

      if (this._htmlRenderElt) {
        this.dom.append(this._htmlRenderElt)

        if (preview) {
          this._htmlRenderElt.classList.add('inline-html-preview')
        }

      }
    } catch (err) {
      console.error(err)
      this._htmlRenderElt?.classList.add('parse-error')
      this.dom.setAttribute('title', (err as any).toString())
    }
  }

  // == Inner Editor ================================== //

  dispatchInner(tr: Transaction) {
    if (!this._innerView) {
      return
    }

    let { state } = this._innerView.state.applyTransaction(tr)
    this._innerView.updateState(state)

    this.renderHtml(true)
  }

  openEditor() {
    if (this._innerView) {
      console.warn('[HTMLInlineView] editor already open when openEditor was called')
      return
    }

    // create a nested ProseMirror view
    this._innerView = new EditorView(this._htmlSrcElt!, {
      state: EditorState.create({
        doc: this._outerView.state.schema.node('paragraph', null, [
          this._outerView.state.schema.text(this._node.attrs?.htmlText),
        ]),
        plugins: [
          history(),
          keymap({
            Tab: (state, dispatch) => {
              if (dispatch) {
                dispatch(state.tr.insertText('\t'))
              }
              return true
            },
            ArrowLeft: collapseCmd(this._outerView, -1, true),
            ArrowRight: collapseCmd(this._outerView, +1, true),
            ArrowUp: collapseCmd(this._outerView, -1, true),
            ArrowDown: collapseCmd(this._outerView, +1, true),
            'Mod-z': (state, dispatch, view) => {
              return undo(state, dispatch, view)
            },
            'Shift-Mod-z': (state, dispatch, view) => {
              return redo(state, dispatch, view)
            },
          }),

          new Plugin({
            props: {
              handleDOMEvents: {
                blur: (view) => {
                  const pos = this._getPos()
                  if (pos !== undefined) {
                    const text = this._innerView?.state.doc.textContent || ''
                    const tr = this._outerView.state.tr
                    tr.setNodeAttribute(pos, 'fromInput', false)
                    tr.setNodeAttribute(pos, 'htmlText', text)
                    this._outerView.dispatch(tr)
                  }
                  this.closeEditor()
                },
              },
            },
          }),
        ],
      }),
      dispatchTransaction: this.dispatchInner.bind(this),
    })

    this._innerView.dom.classList.add('inline-html-src')
    this._innerView.dom.classList.remove('ProseMirror')

    // focus element
    let innerState = this._innerView.state
    this._innerView.focus()

    let innerPos = innerState.doc.textContent.length || 0

    this._innerView.dispatch(
      innerState.tr.setSelection(TextSelection.create(innerState.doc, innerPos)),
    )

    this._htmlRenderElt?.classList.add('inline-html-preview')

    this._isEditing = true
  }

  /**
   * Called when the inner ProseMirror editor should close.
   *
   * @param render Optionally update the rendered html after closing. (which
   *    is generally what we want to do, since the user is done editing!)
   */
  closeEditor(render: boolean = true) {
    if (this._innerView) {
      const pos = this._getPos()
      if (pos !== undefined) {
        const text = this._innerView.state.doc.textContent || ''
        // const tr = this._outerView.state.tr
        // console.log('text', text)
        // console.log('pos', pos)
        // tr.setNodeAttribute(pos - 1, 'htmlText', text)
        // this._outerView.dispatch(tr)
      }
      this._innerView?.destroy()
      this._innerView = undefined
    }

    if (render) {
      this.renderHtml()
      this._htmlRenderElt?.classList.add('inline-html-render')
      this._htmlRenderElt?.classList.remove('inline-html-preview')
    }

    this._isEditing = false
  }
}
