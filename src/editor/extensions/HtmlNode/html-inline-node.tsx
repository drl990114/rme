import { NodeSerializerOptions, ParserRuleType } from '@/editor/transform'
import { getAttrsBySignalHtmlContent, getTagName, isImageElement } from '@/editor/utils/html'
import { EditorState, PluginKey, TextSelection } from '@remirror/pm/state'
import { EditorView } from '@remirror/pm/view'
import { NodeViewComponentProps } from '@remirror/react'
import ReactCodeMirror from '@uiw/react-codemirror'
import { ComponentType, useEffect, useRef, useState } from 'react'
import type {
  ApplySchemaAttributes,
  CreateExtensionPlugin,
  InputRule,
  MarkExtensionSpec,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeViewMethod,
} from 'remirror'
import {
  ExtensionTag,
  MarkExtension,
  NodeExtension,
  extension,
  nodeInputRule,
  plainInputRule,
  prosemirrorNodeToDom,
} from 'remirror'
import { HTMLInlineView } from './html-inline-view'
import {
  excludeHtmlInlineNodes,
  needSplitInlineHtmlTokenTags,
} from '@/editor/transform/markdown-it-html-inline'
import block_names from 'markdown-it/lib/common/html_blocks.mjs'

const attr_name = '[a-zA-Z_:][a-zA-Z0-9:._-]*'

const unquoted = '[^"\'=<>`\\x00-\\x20]+'
const single_quoted = "'[^']*'"
const double_quoted = '"[^"]*"'

const attr_value = '(?:' + unquoted + '|' + single_quoted + '|' + double_quoted + ')'

const attribute = '(?:\\s+' + attr_name + '(?:\\s*=\\s*' + attr_value + ')?)'

const open_tag = '<[A-Za-z][A-Za-z0-9\\-]*' + attribute + '*\\s*\\/?>'

const close_tag = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>'

const HTML_OPEN_CLOSE_TAG_RE = new RegExp('(?:' + open_tag + '|' + close_tag + ')', 'g')

type LineHtmlInlineExtensionOptions = {
  handleViewImgSrcUrl?: (src: string) => Promise<string>
}
@extension<LineHtmlInlineExtensionOptions>({
  defaultOptions: {
    handleViewImgSrcUrl: async (src: string) => src,
  },
})
export class HtmlInlineNodeExtension extends NodeExtension<LineHtmlInlineExtensionOptions> {
  static disableExtraAttributes = true

  get name() {
    return 'html_inline_node' as const
  }

  createTags() {
    return [ExtensionTag.InlineNode]
  }

  createNodeSpec(): NodeExtensionSpec {
    return {
      inline: true,
      selectable: true,
      atom: true,
      marks: '',
      attrs: {
        key: {
          default: '',
        },
        htmlText: {
          default: '',
        },
        fromInput: {
          default: false,
        },
      },
      toDOM: (node) => {
        const dom = document.createElement('div')

        dom.classList.add('inline-html-render')
        dom.innerHTML = node.attrs.htmlText

        return dom
      },
    }
  }

  createNodeViews(): NodeViewMethod | Record<string, NodeViewMethod> {
    return (node, view, getPos) => new HTMLInlineView(node, view, getPos)
  }

  createInputRules(): InputRule[] {
    const rules: InputRule[] = [
      nodeInputRule({
        regexp: HTML_OPEN_CLOSE_TAG_RE,
        type: this.type,
        getAttributes: (match) => {
          return {
            htmlText: match[0],
            fromInput: true,
          }
        },
        beforeDispatch: ({ tr, start, match }) => {
          const $pos = tr.doc.resolve(start)
          const node = $pos.node(1)
          console.log('last', node.lastChild)

          // if (node.lastChild?.type.name === 'html_inline_node') {
          //   tr.setNodeAttribute(start, 'fromInput', true )
          // }
          console.log('node', node)
          // tr.setSelection(TextSelection.near($pos))
        },
        shouldSkip: (props) => {
          const tagName = getTagName(props.fullMatch)

          if (needSplitInlineHtmlTokenTags.includes(tagName) || block_names.includes(tagName)) {
            return true
          }

          props.state.tr.replaceRangeWith(
            props.start,
            props.end,
            this.type.create({ htmlText: props.fullMatch, fromInput: true }),
          )

          return false
        },
      }),
    ]

    return rules
  }

  public fromMarkdown() {
    return [
      {
        type: ParserRuleType.inline,
        token: 'html_inline_node',
        node: this.name,
      },
    ] as const
  }

  public toMarkdown({ state, node }: NodeSerializerOptions) {
    state.text(node.attrs.htmlText || '')
  }
}
