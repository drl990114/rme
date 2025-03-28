import type { CreateExtensionPlugin, ExtensionCommandReturn } from '@remirror/core'
import { PlainExtension } from '@remirror/core'
import { Slice, Node } from '@remirror/pm/model'
import { DOMParser } from '@remirror/pm/model'
import { getTransformerByView } from '../Transformer/utils'

type UnknownRecord = Record<string, unknown>
function isPureText(content: UnknownRecord | UnknownRecord[] | undefined | null): boolean {
  if (!content) return false
  if (Array.isArray(content)) {
    if (content.length > 1) return false
    return isPureText(content[0])
  }

  const child = content.content
  if (child) return isPureText(child as UnknownRecord[])

  return content.type === 'text'
}

function isTextOnlySlice(slice: Slice): Node | false {
  if (slice.content.childCount === 1) {
    const node = slice.content.firstChild
    if (node?.type.name === 'text' && node.marks.length === 0) return node

    if (node?.type.name === 'paragraph' && node.childCount === 1) {
      const _node = node.firstChild
      if (_node?.type.name === 'text' && _node.marks.length === 0) return _node
    }
  }

  return false
}

export class ClipboardExtension extends PlainExtension {
  get name() {
    return 'clipboard' as const
  }

  createPlugin(): CreateExtensionPlugin {
    return {
      props: {
        handlePaste: (view, event) => {
          const transformer = getTransformerByView(view)

          const parser = transformer.stringToDoc
          const schema = view.state.schema
          const editable = view.props.editable?.(view.state)
          const { clipboardData } = event
          if (!editable || !clipboardData) return false

          const currentNode = view.state.selection.$from.node()
          if (currentNode.type.spec.code) return false

          const text = clipboardData.getData('text/plain')

          const html = clipboardData.getData('text/html')
          if (html.length === 0 && text.length === 0) return false

          const domParser = DOMParser.fromSchema(schema)
          let dom
          if (text) {
            const slice = parser?.(text)

            if (!slice || typeof slice === 'string') return false

            const res: Node[] = []
            slice.content.forEach((node, index) => {
              if (node.type.name === 'paragraph' && index === 0) {
                node.content.forEach((child) => {
                  res.push(child)
                })
              } else {
                res.push(node)
              }
            })

            view.dispatch(view.state.tr.replaceSelectionWith(res, false))

            return true
          } else {
            const template = document.createElement('template')
            template.innerHTML = html
            dom = template.content.cloneNode(true)
            template.remove()
          }

          const slice = domParser.parseSlice(dom)
          const node = isTextOnlySlice(slice)
          if (node) {
            view.dispatch(view.state.tr.replaceSelectionWith(node, true))
            return true
          }

          view.dispatch(view.state.tr.replaceSelection(slice))
          return true
        },
        clipboardTextSerializer: (slice, view) => {
          const schema = view.state.schema
          const transformer = getTransformerByView(view)
          const serializer = transformer.docToString
          const isText = isPureText(slice.content.toJSON())
          if (isText)
            return (slice.content as unknown as Node).textBetween(0, slice.content.size, '\n\n')

          const doc = schema.topNodeType.createAndFill(undefined, slice.content)
          if (!doc) return ''
          const value = serializer?.(doc) || ''
          return value
        },
      },
    }
  }
}
