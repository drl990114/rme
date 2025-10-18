import { isHTMLElement } from '@ocavue/utils'
import { CreateExtensionPlugin, EditorView, PlainExtension, ResolvedPos } from '@rme-sdk/core'
import { NodeSelection, TextSelection } from '@rme-sdk/pm/state'
import { buildGetTarget, GetTarget } from './drop-target'
import { pluginKey } from './node-indicator-plugin'
import { findBlockByCoords, findFirstLineRect } from './node-target'
import type { NodeIndicatorState, ViewDragging } from './types'

export class NodeIndicatorExtension extends PlainExtension {
  get name() {
    return 'nodeIndicator' as const
  }

  createPlugin(): CreateExtensionPlugin<NodeIndicatorState> {
    let getTarget: GetTarget | undefined

    const initialState: NodeIndicatorState = {
      node: null,
      pos: null,
      rect: null,
    }
    return {
      key: pluginKey,
      initialState,
      state: {
        init: () => initialState,
        apply: (tr, value) => {
          const meta = tr.getMeta(pluginKey)
          if (meta) {
            return { ...value, ...meta }
          }

          if (tr.docChanged) {
            return { ...value }
          }
          return value
        },
      },
      view: (view) => {
        getTarget = buildGetTarget(view)
        return {}
      },
      props: {
        handleDrop: (view, event, slice, move): boolean => {
          if (!getTarget) {
            return false
          }

          const target = getTarget([event.clientX, event.clientY], event)

          if (!target) {
            return false
          }

          event.preventDefault()
          let insertPos = target[0]

          let tr = view.state.tr

          if (move) {
            // const ext = view.state.plugins.find((plugin) => {
            //   return plugin.spec.initialState?.isDragging === false
            // })

            // const state = ext?.getState(view.state) || {}
            // const { node: draggingNode, pos: draggingPos } = state
            // console.log('extstate', state)
            // if (!draggingNode || !draggingPos) return false
            // tr = tr.delete(draggingPos, draggingPos + draggingNode.nodeSize)

            let { node } = (view.dragging as ViewDragging | null) || {}
            if (node) node.replace(tr)
            else tr.deleteSelection()
          }

          let pos = tr.mapping.map(insertPos)
          let isNode = slice.openStart == 0 && slice.openEnd == 0 && slice.content.childCount == 1
          let beforeInsert = tr.doc
          if (isNode) tr.replaceRangeWith(pos, pos, slice.content.firstChild!)
          else tr.replaceRange(pos, pos, slice)
          if (tr.doc.eq(beforeInsert)) {
            return false
          }

          let $pos = tr.doc.resolve(pos)
          if (
            isNode &&
            NodeSelection.isSelectable(slice.content.firstChild!) &&
            $pos.nodeAfter &&
            $pos.nodeAfter.sameMarkup(slice.content.firstChild!)
          ) {
            tr.setSelection(new NodeSelection($pos))
          } else {
            let end = tr.mapping.map(insertPos)
            tr.mapping.maps[tr.mapping.maps.length - 1].forEach(
              (_from, _to, _newFrom, newTo) => (end = newTo),
            )
            tr.setSelection(selectionBetween(view, $pos, tr.doc.resolve(end)))
          }
          view.focus()
          view.dispatch(tr.setMeta('uiEvent', 'drop'))
          return true
        },
        handleDOMEvents: {
          pointermove: (view, event) => {
            const { x, y } = event
            const block = findBlockByCoords(view, x, y)

            if (!block) {
              view.dispatch(view.state.tr.setMeta(pluginKey, { node: null, pos: null }))
              return
            }

            const { node, pos } = block
            const element = view.nodeDOM(pos)
            if (!element || !isHTMLElement(element)) {
              view.dispatch(view.state.tr.setMeta(pluginKey, { node: null, pos: null }))
              return
            }

            const $pos = view.state.doc.resolve(pos)
            if ($pos.depth > 0 && $pos.index($pos.depth) === 0) {
              const parentPos = $pos.before($pos.depth)
              const parentNode = $pos.parent
              const parentElement = view.nodeDOM(parentPos)

              const rect = findFirstLineRect(parentElement, element)
              view.dispatch(
                view.state.tr.setMeta(pluginKey, {
                  node: parentNode,
                  pos: parentPos,
                  rect: rect || {},
                }),
              )
            } else {
              const rect = findFirstLineRect(undefined, element)
              view.dispatch(view.state.tr.setMeta(pluginKey, { node, pos, rect: rect || {} }))
            }
            return false
          },
        },
      },
    }
  }
}

function selectionBetween(
  view: EditorView,
  $anchor: ResolvedPos,
  $head: ResolvedPos,
  bias?: number,
) {
  return (
    view.someProp('createSelectionBetween', (f) => f(view, $anchor, $head)) ||
    TextSelection.between($anchor, $head, bias)
  )
}

export type { NodeIndicatorPluginOptions, NodeIndicatorState } from './types'
export { pluginKey }

