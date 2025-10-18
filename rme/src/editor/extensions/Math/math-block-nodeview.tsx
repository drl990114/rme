// prosemirror imports
import { exitCode } from '@rme-sdk/pm/commands'
import { history, redo, undo } from '@rme-sdk/pm/history'
import { keymap } from '@rme-sdk/pm/keymap'
import { Node as ProseNode } from '@rme-sdk/pm/model'
import {
  Command,
  EditorState,
  Plugin,
  Selection,
  TextSelection,
  Transaction,
} from '@rme-sdk/pm/state'
import { Decoration, EditorView, NodeView } from '@rme-sdk/pm/view'
import katex from 'katex'

/**
 * Create a ProseMirror command to collapse the inner editor selection back to the outer view.
 */
function collapseCmd(
  outerView: EditorView,
  dir: 1 | -1,
  requireOnBorder: boolean,
  requireEmptySelection: boolean = true,
  getPos?: () => number | undefined,
  node?: ProseNode,
): Command {
  return (innerState: EditorState, dispatch) => {
    const outerState = outerView.state
    const { to: innerTo, from: innerFrom } = innerState.selection

    if (requireEmptySelection && innerTo !== innerFrom) return false

    const currentPos = dir > 0 ? innerTo : innerFrom
    if (requireOnBorder) {
      const nodeSize = innerState.doc.nodeSize - 2
      if (dir > 0 && currentPos < nodeSize) return false
      if (dir < 0 && currentPos > 0) return false
    }

    if (dispatch) {
      // 获取数学块节点的位置
      const pos = getPos?.()
      if (pos === undefined || !node) return false

      // 根据方向计算目标位置
      let targetPos: number
      if (dir > 0) {
        // 向右/向下：移动到数学块节点之后
        targetPos = pos + node.nodeSize
      } else {
        // 向左/向上：移动到数学块节点之前
        targetPos = pos
      }

      if (targetPos < 0 || targetPos > outerState.doc.content.size) {
        return false
      }

      if (dir === 1 && exitCode(outerView.state, outerView.dispatch)) {
        outerView.focus()
      } else {
        const selection = Selection.near(outerState.doc.resolve(targetPos), dir)
        const tr = outerView.state.tr.setSelection(selection).scrollIntoView()
        outerView.dispatch(tr)
        outerView.focus()
      }
      return true
    }

    return true
  }
}

export class MathBlockView implements NodeView {
  private _node: ProseNode
  private _outerView: EditorView
  private _getPos: () => number | undefined

  dom: HTMLElement
  private _renderElt: HTMLElement | undefined
  private _srcElt: HTMLElement | undefined
  private _innerView: EditorView | undefined
  private _isEditing: boolean

  constructor(node: ProseNode, view: EditorView, getPos: () => number | undefined) {
    this._node = node
    this._outerView = view
    this._getPos = getPos
    this._isEditing = false

    this.dom = document.createElement('div')
    this.dom.classList.add('math-block-nodeview')

    this._renderElt = document.createElement('div')
    this._renderElt.classList.add('math-block-render')
    this.dom.appendChild(this._renderElt)

    this._srcElt = document.createElement('div')
    this._srcElt.spellcheck = false
    this._srcElt.style.display = 'none'
    this.dom.appendChild(this._srcElt)

    this.dom.addEventListener('click', () => this.ensureFocus())

    if ((node.attrs as any).fromInput) {
      this.openEditor()
    } else {
      this.renderTex()
    }
  }

  destroy() {
    this.closeEditor(false)
    if (this._renderElt) {
      this._renderElt.remove()
      delete this._renderElt
    }
    if (this._srcElt) {
      this._srcElt.remove()
      delete this._srcElt
    }
    this.dom.remove()
  }

  ensureFocus() {
    if (this._outerView.hasFocus()) {
      if (this._innerView) {
        this._innerView.focus()
      } else {
        this.openEditor()
      }
    }
  }

  update(node: ProseNode, _decorations: readonly Decoration[]) {
    if (!node.sameMarkup(this._node)) return false
    this._node = node
    if (!this._isEditing) this.renderTex()
    return true
  }

  setSelection(): void {
    if (!this._innerView) {
      this.openEditor()
    } else {
    }
  }

  stopEvent(): boolean {
    return true
  }

  ignoreMutation() {
    return true
  }

  private renderTex(preview = false) {
    if (!this._renderElt) return
    const raw = this._innerView?.state.doc.textContent ?? (this._node.attrs as any).tex ?? ''
    const tex: string = raw.replace(/\u200b/g, '').trim()

    try {
      while (this._renderElt.firstChild) {
        this._renderElt.firstChild.remove()
      }

      const container = document.createElement('div')
      container.setAttribute('data-type', 'math-block')

      katex.render(tex || '', container, {
        throwOnError: false,
        displayMode: false,
        output: 'mathml',
      })

      let newRenderEl: HTMLElement = container
      if (container.childElementCount === 1 && container.firstElementChild) {
        newRenderEl = container.firstElementChild as HTMLElement
      }

      this._renderElt.replaceWith(newRenderEl)
      this._renderElt = newRenderEl

      console.log('this.renderElt', this._renderElt.outerHTML)
      this.dom.appendChild(this._renderElt)

      if (preview) {
        this._renderElt.classList.add('math-block-preview')
      } else {
        this._renderElt.classList.add('math-block-render')
        this._renderElt.classList.remove('math-block-preview')
      }
    } catch (err) {
      console.error(err)
      this._renderElt.classList.add('parse-error')
      this.dom.setAttribute('title', String(err))
    }
  }

  private dispatchInner(tr: Transaction) {
    if (!this._innerView) return

    // 使用正确的方式应用事务
    const newState = this._innerView.state.apply(tr)
    this._innerView.updateState(newState)
    this.renderTex(true)
  }

  private openEditor = () => {
    if (this._innerView) return

    const currentTex: string = ((this._node.attrs as any).tex ?? '') as string

    this._innerView = new EditorView(this._srcElt!, {
      state: EditorState.create({
        doc: this._outerView.state.schema.node(
          'paragraph',
          null,
          currentTex
            ? [this._outerView.state.schema.text(currentTex)]
            : [this._outerView.state.schema.text('\u200b')],
        ),
        plugins: [
          history(),
          keymap({
            Tab: (state, dispatch) => {
              if (dispatch) dispatch(state.tr.insertText('\t'))
              return true
            },
            ArrowLeft: collapseCmd(this._outerView, -1, true, true, this._getPos, this._node),
            ArrowRight: collapseCmd(this._outerView, +1, true, true, this._getPos, this._node),
            ArrowUp: collapseCmd(this._outerView, -1, true, true, this._getPos, this._node),
            ArrowDown: collapseCmd(this._outerView, +1, true, true, this._getPos, this._node),
            'Mod-z': (state, dispatch, view) => undo(state, dispatch, view),
            'Shift-Mod-z': (state, dispatch, view) => redo(state, dispatch, view),
            Backspace: (state, dispatch) => {
              const { from, to } = state.selection
              if (from === 0 && to === state.doc.content.size) {
                // If the inner editor is empty, delete the whole math block node
                const pos = this._getPos()
                if (pos !== undefined) {
                  const tr = this._outerView.state.tr.delete(pos, pos + this._node.nodeSize)
                  this._outerView.dispatch(tr)
                  this._outerView.focus()
                  return true
                }
              }
              return false
            },
          }),
          new Plugin({
            props: {
              handleDOMEvents: {
                blur: () => {
                  const pos = this._getPos()
                  if (pos !== undefined) {
                    const text = (this._innerView?.state.doc.textContent || '').replace(
                      /\u200b/g,
                      '',
                    )
                    const tr = this._outerView.state.tr
                    tr.setNodeAttribute(pos, 'fromInput', false)
                    tr.setNodeAttribute(pos, 'tex', text)
                    this._outerView.dispatch(tr)
                  }
                  this.closeEditor()
                  return true
                },
              },
            },
          }),
        ],
      }),
      dispatchTransaction: this.dispatchInner.bind(this),
    })

    this._innerView.dom.classList.add('inline-input-src')
    this._innerView.dom.classList.remove('ProseMirror')
    this._srcElt!.style.display = 'inline'

    const innerState = this._innerView.state
    this._innerView.focus()
    const innerPos = innerState.doc.textContent.length || 0
    this._innerView.dispatch(
      innerState.tr.setSelection(TextSelection.create(innerState.doc, innerPos)),
    )

    this._renderElt?.classList.add('math-block-preview')
    this._isEditing = true
  }

  private closeEditor = (render: boolean = true) => {
    if (this._srcElt) {
      this._srcElt.style.display = 'none'
    }
    if (this._innerView) {
      this._innerView.destroy()
      this._innerView = undefined
    }
    if (render) {
      this.renderTex()
    }
    this._isEditing = false
  }
}
