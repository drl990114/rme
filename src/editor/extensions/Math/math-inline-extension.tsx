import type { NodeSerializerOptions } from '@/editor/transform'
import { ParserRuleType } from '@/editor/transform'
import type { ApplySchemaAttributes, InputRule, NodeExtensionSpec, NodeSpecOverride, ProsemirrorAttributes } from '@remirror/core'
import { extension, ExtensionTag, NodeExtension, nodeInputRule, omitExtraAttributes } from '@remirror/core'
import type { NodeViewMethod } from 'remirror'
import { MathInlineView } from './math-inline-nodeview'

export interface MathInlineAttributes {
  tex: string
}

export type MathInlineNodeAttrs = ProsemirrorAttributes<MathInlineAttributes>

@extension({
  defaultOptions: {},
})
export class MathInlineExtension extends NodeExtension {
  static disableExtraAttributes = true
  get name() {
    return 'math_inline' as const
  }

  createTags() {
    return [ExtensionTag.InlineNode]
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      inline: true,
      atom: true,
      selectable: true,
      // disallow marks on the inline atom similar to html-inline-node
      marks: '',
      ...override,
      attrs: {
        ...extra.defaults(),
        tex: { default: '' },
        fromInput: { default: false },
      },
      parseDOM: [
        {
          tag: 'span[data-type="math-inline"]',
          getAttrs: (dom) => {
            const el = dom as HTMLElement
            return { ...extra.parse(dom), tex: el.getAttribute('data-tex') ?? '' }
          },
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        const attrs = omitExtraAttributes(node.attrs, extra)
        return ['span', { ...extra.dom(node), 'data-type': 'math-inline', 'data-tex': attrs.tex }]
      },
    }
  }

  createInputRules(): InputRule[] {
    // Support both pasted HTML span and typed $...$ inline math
    return [
      // Typed inline math trigger: $$ -> insert empty inline math and focus inside
      nodeInputRule({
        regexp: /\$\$(?!\$)/,
        type: this.type,
        getAttributes: () => ({ tex: '', fromInput: true }),
      }),
      // Pasted HTML span -> inline math node
      nodeInputRule({
        regexp: /<span[^>]*data-type=["']math-inline["'][^>]*><\/span>/,
        type: this.type,
        getAttributes: () => ({ fromInput: false }),
      }),
      // Typed inline math: $...$
      // Avoids $$...$$ by requiring at least one non-$ char between delimiters
      nodeInputRule({
        regexp: /\$([^$\n]+?)\$/,
        type: this.type,
        getAttributes: (match) => {
          console.log(match)
          return { tex: match[1] ?? '', fromInput: true }
        },
      }),
    ]
  }

  public fromMarkdown() {
    return [
      {
        type: ParserRuleType.inline,
        token: 'math_inline',
        node: this.name,
        getAttrs: (tok: any) => {
          return { tex: tok.attrs?.tex || '' }
        },
      },
    ] as const
  }

  public toMarkdown({ state, node }: NodeSerializerOptions) {
    const tex = (node.attrs as any).tex as string
    state.text(`$${tex}$`, false)
  }

  createNodeViews(): NodeViewMethod | Record<string, NodeViewMethod> {
    return (node, view, getPos) => new MathInlineView(node, view, getPos)
  }
}


