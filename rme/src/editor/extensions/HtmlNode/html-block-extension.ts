import type {
  ApplySchemaAttributes,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeViewMethod,
  PrioritizedKeyBindings,
} from '@rme-sdk/core'
import { NodeExtension, extension, isElementDomNode, nodeInputRule } from '@rme-sdk/core'
import type { InputRule } from '@rme-sdk/pm/inputrules'
import { TextSelection } from '@rme-sdk/pm/state'
import block_names from 'markdown-it/lib/common/html_blocks.mjs'
import type { NodeSerializerOptions } from '../../transform'
import { ParserRuleType } from '../../transform'
import { needSplitInlineHtmlTokenTags } from '../../transform/markdown-it-html-inline'
import { arrayExclude } from '../../utils/common'
import { arrowHandler } from '../CodeMirror/codemirror-utils'
import type { LineHtmlBlockExtensionOptions } from './html-block-types'
import { HtmlNodeView } from './html-block-view'

@extension<LineHtmlBlockExtensionOptions>({
  defaultOptions: {},
  staticKeys: [],
  handlerKeys: [],
  customHandlerKeys: [],
})
export class LineHtmlBlockExtension extends NodeExtension<LineHtmlBlockExtensionOptions> {
  get name() {
    return 'html_block' as const
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
        language: { default: 'html' },
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
        return ['pre', ['code', 0]]
      },
      isolating: true,
    }
  }

  createNodeViews(): NodeViewMethod {
    return (node, view, getPos) => {
      return new HtmlNodeView(node, view, getPos as () => number, this.options)
    }
  }

  createInputRules(): InputRule[] {
    const rules: InputRule[] = [
      nodeInputRule({
        regexp: new RegExp(
          '^</?(' +
            arrayExclude(block_names, needSplitInlineHtmlTokenTags).join('|') +
            ')(?=(\\s|/?>|$))',
          'i',
        ),
        type: this.type,
        beforeDispatch: ({ tr, start, match }) => {
          const $pos = tr.doc.resolve(start)
          tr.setSelection(TextSelection.near($pos))
          tr.insertText(match[0])
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
        token: 'html_block',
        node: this.name,
        hasOpenClose: false,
      },
    ] as const
  }

  public toMarkdown({ state, node }: NodeSerializerOptions) {
    state.write('\n')
    state.text(node.textContent, false)
    state.text('\n')
    state.closeBlock(node)
    state.ensureNewLine()
  }
}
