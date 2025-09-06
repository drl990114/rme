import type { NodeSerializerOptions } from '@/editor/transform'
import { ParserRuleType } from '@/editor/transform'
import type {
  ApplySchemaAttributes,
  InputRule,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeViewMethod,
  PrioritizedKeyBindings,
} from '@remirror/core'
import { extension, ExtensionTag, NodeExtension, nodeInputRule } from '@remirror/core'
import { arrowHandler } from '../CodeMirror/codemirror-utils'
import { MathBlockView } from './math-block-nodeview'

@extension({
  defaultOptions: {},
})
export class MathBlockExtension extends NodeExtension {
  get name() {
    return 'math_block' as const
  }

  createTags() {
    return [ExtensionTag.Block]
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      group: 'block',
      content: 'text*',
      defining: true,
      code: true,
      marks: '',
      ...override,
      attrs: {
        ...extra.defaults(),
        tex: { default: '' },
        fromInput: { default: false },
      },
      parseDOM: [
        {
          tag: 'div[data-type="math-block"]',
          getAttrs: (dom) => extra.parse(dom),
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: () => ['div', { 'data-type': 'math-block' }, 0],
      isolating: true,
    }
  }

  createNodeViews(): NodeViewMethod | Record<string, NodeViewMethod> {
    return (node, view, getPos) => new MathBlockView(node, view, getPos)
  }

  createInputRules(): InputRule[] {
    return [
      nodeInputRule({
        regexp: /^\$\$$/,
        type: this.type,
        getAttributes: (match) => {
          return { tex: match[1] ?? '', fromInput: true }
        },
      }),
    ]
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
        token: 'math_block',
        node: this.name,
        hasOpenClose: false,
        getAttrs: (tok: any) => {
          return { tex: tok.attrs?.tex || '' }
        },
      },
    ] as const
  }

  public toMarkdown({ state, node }: NodeSerializerOptions) {
    state.write('$$\n')
    const tex = node.attrs.tex || ''
    state.text(tex, false)

    if (!tex.endsWith('\n')) {
      state.text('\n')
    }

    state.write('$$')
    state.closeBlock(node)
    state.ensureNewLine()
  }
}
