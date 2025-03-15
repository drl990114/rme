import type { NodeSerializerOptions } from '../../transform'
import { ParserRuleType } from '../../transform'
import type {
  ApplySchemaAttributes,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeViewMethod,
  PrioritizedKeyBindings,
} from '@remirror/core'
import { NodeExtension, isElementDomNode, nodeInputRule } from '@remirror/core'
import type { ProsemirrorNode } from '@remirror/pm'
import { MermaidNodeView } from './mermaid-view'
import type { InputRule } from '@remirror/pm/inputrules'
import { TextSelection } from '@remirror/pm/state'
import { arrowHandler } from '../CodeMirror/codemirror-utils'

export class MermaidBlockExtension extends NodeExtension {
  get name() {
    return 'mermaid_node' as const
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      group: 'block',
      content: 'text*',
      defining: true,
      ...override,
      code: true,
      marks: '',
      attrs: {
        ...extra.defaults(),
      },
      parseDOM: [
        {
          tag: 'pre',
          getAttrs: (node) => (isElementDomNode(node) ? extra.parse(node) : false),
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM() {
        return ['pre', { 'data-type': 'mermaid' }, 0]
      },
      isolating: true,
    }
  }

  createNodeViews(): NodeViewMethod {
    return (node: ProsemirrorNode, view, getPos) => {
      return new MermaidNodeView(node, view, getPos as () => number)
    }
  }

  createInputRules(): InputRule[] {
    const rules: InputRule[] = [
      nodeInputRule({
        regexp: /^```mermaid$/,
        type: this.type,
        beforeDispatch: ({ tr, start, match }) => {
          const $pos = tr.doc.resolve(start)
          tr.setSelection(TextSelection.near($pos))
        },
      }),
    ]

    return rules
  }

  createKeymap(): PrioritizedKeyBindings {
    return {
      ArrowLeft: arrowHandler('left'),
      ArrowRight: arrowHandler('right'),
      ArrowUp: arrowHandler('up'),
      ArrowDown: arrowHandler('down'),
    }
  }

  public fromMarkdown() {
    return [
      {
        type: ParserRuleType.block,
        token: 'mermaid_node',
        node: this.name,
        hasOpenClose: false,
      },
    ] as const
  }

  public toMarkdown({ state, node }: NodeSerializerOptions) {
    state.write('```mermaid\n')
    state.text(node.textContent, false)
    state.text('\n')
    state.write('```')
    state.closeBlock(node)
    state.ensureNewLine()
  }
}
