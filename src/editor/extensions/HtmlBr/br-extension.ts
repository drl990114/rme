import type { ApplySchemaAttributes, NodeExtensionSpec, NodeSpecOverride } from '@remirror/core'
import { extension, ExtensionTag, NodeExtension } from '@remirror/core'
import type { NodeSerializerOptions } from '@/editor/transform'
import { ParserRuleType } from '@/editor/transform'

export interface HtmlBrOptions {}

@extension<HtmlBrOptions>({
  defaultOptions: {},
})
export class HtmlBrExtension extends NodeExtension<HtmlBrOptions> {
  static disableExtraAttributes = true

  get name() {
    return 'html_br' as const
  }

  createTags() {
    return [ExtensionTag.InlineNode]
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      inline: true,
      selectable: true,
      atom: true,
      ...override,
      attrs: {},
      parseDOM: [
        {
          tag: 'br',
        },
      ],
      toDOM: () => {
        return ['br']
      },
    }
  }

  public fromMarkdown() {
    return [
      {
        type: ParserRuleType.inline,
        token: 'html_br',
        node: this.name,
      },
    ] as const
  }

  public toMarkdown({ state, node }: NodeSerializerOptions) {
    state.text('<br/>', false)
  }
}
