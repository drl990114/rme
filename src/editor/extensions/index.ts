import {
  // BoldExtension,
  // BulletListExtension,
  // CodeBlockExtension,
  DropCursorExtension,
} from 'remirror/extensions'
import { LineTableCellExtension, LineTableHeaderCellExtension } from './Table/table-extension'
// import data from 'svgmoji/emoji.json'
import { CountExtension } from '@remirror/extension-count'
import { corePreset } from '@remirror/preset-core'
import { ReactComponentExtension } from '@remirror/react'
import { AIExtension } from './Ai'
import { AIOptions } from './Ai/ai-types'
import { LineBlockquoteExtension } from './BlockQuote'
import { ClipboardExtension } from './Clipboard'
import { LineCodeMirrorExtension } from './CodeMirror/codemirror-extension'
import { CustomCopyFunction } from './CodeMirror/codemirror-types'
import { minimalSetup } from './CodeMirror/setup'
import { FindExtension } from './Find'
import { HandleInputExtension } from './HandleInput/handle-input-extension'
import { LineHardBreakExtension } from './HardBreak'
import { LineHeadingExtension } from './Heading'
import { LineHorizontalRuleExtension } from './HorizontalRule'
import { HtmlBrExtension } from './HtmlBr/br-extension'
import { LineHtmlBlockExtension } from './HtmlNode/html-block-extension'
import { HtmlInlineNodeExtension } from './HtmlNode/html-inline-node'
import { IframeExtension } from './Iframe'
import { HtmlImageExtension } from './Image'
import { MdImgUriExtension } from './Image/md-image-extension'
import { LineInlineDecorationExtension, LineInlineMarkExtension, markExtensions } from './Inline'
import { LineListExtension } from './List'
import { MathBlockExtension, MathInlineExtension } from './Math'
import { MermaidBlockExtension } from './Mermaid'
import { LineParagraphExtension } from './Paragraph'
import { PlaceholderExtension } from './Placeholder'
import { ShortcutsExtension } from './Shortcuts/shortcuts-extension'
import { SlashMenuExtension } from './SlashMenu'
import { LineTableExtension, LineTableRowExtension } from './Table'
import { LineTextExtension } from './Text'
import { TransformerExtension } from './Transformer/transformer-extension'

// import { TableExtension } from './ReactTables';

export * from './List'

export type ExtensionsOptions = {
  disableAllBuildInShortcuts?: boolean

  handleViewImgSrcUrl?: (src: string) => Promise<string>

  imageHostingHandler?: (src: string) => Promise<string>

  imageCopyHandler?: (src: string) => Promise<string>

  ai?: AIOptions

  customCopyFunction?: CustomCopyFunction
}

function extensions(options: ExtensionsOptions): any[] {
  const { handleViewImgSrcUrl, imageHostingHandler, imageCopyHandler } = options

  const res: any[] = [
    ...corePreset({ excludeExtensions: ['paragraph', 'text'] }),
    ...markExtensions({
      handleViewImgSrcUrl,
    }),
    new CountExtension({}),
    new HtmlImageExtension({
      handleViewImgSrcUrl,
      imageHostingHandler,
    }),
    new MdImgUriExtension({
      handleViewImgSrcUrl,
      imageHostingHandler,
    }),
    new HandleInputExtension(),
    new HtmlBrExtension(),
    new IframeExtension({
      enableResizing: true,
    }),
    // new LineHtmlInlineExtension({
    //   handleViewImgSrcUrl,
    // }),

    new PlaceholderExtension({ placeholder: "Type '/' for commands" }),
    new LineHorizontalRuleExtension({}),
    new LineParagraphExtension(),
    new LineTextExtension(),
    new LineHardBreakExtension(),
    new LineBlockquoteExtension(),
    new LineHeadingExtension({}),
    new LineListExtension(),
    new LineCodeMirrorExtension({
      extensions: [minimalSetup],
      useProsemirrorHistoryKey: true,
      customCopyFunction: options.customCopyFunction,
    }),
    new LineHtmlBlockExtension({
      customCopyFunction: options.customCopyFunction,
    }),
    new MermaidBlockExtension({
      customCopyFunction: options.customCopyFunction,
    }),
    new LineTableExtension({ resizable: false }),
    new LineTableRowExtension(),
    new LineTableCellExtension(),
    new LineTableHeaderCellExtension(),
    new FindExtension({
      decoration: { style: 'background-color: yellow; color: black' },
      activeDecoration: { style: 'background-color: orange; color: black' },
    }),
    new HtmlInlineNodeExtension({
      handleViewImgSrcUrl,
    }),
    new ClipboardExtension({
      imageCopyHandler,
    }),

    new ReactComponentExtension({}),
    new DropCursorExtension({}),

    new SlashMenuExtension(),
    new LineInlineMarkExtension(),
    new LineInlineDecorationExtension(),

    new MathBlockExtension({}),
    new MathInlineExtension({}),

    new ShortcutsExtension({
      disableAllBuildInShortcuts: options.disableAllBuildInShortcuts,
    }),

    new TransformerExtension({}),
  ]

  if (options.ai) {
    res.push(new AIExtension(options.ai))
  }

  return res
}

export default extensions
