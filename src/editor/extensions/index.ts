import { LineTableCellExtension, LineTableHeaderCellExtension } from './Table/table-extension'
import {
  // BoldExtension,
  // BulletListExtension,
  // CodeBlockExtension,
  DropCursorExtension,
  // MentionExtension,
  // EmojiExtension,
  // GapCursorExtension,
  // HardBreakExtension,
  // HeadingExtension,
  // HistoryExtension,
  // ItalicExtension,
  // LinkExtension,
  // ListItemExtension,
  // ListItemSharedExtension,
  // OrderedListExtension,
  // ShortcutsExtension,
  // StrikeExtension,
  // SubExtension,
  // TableCellExtension,
  // TableExtension,
  // TaskListExtension,
  // UnderlineExtension,
  // PlaceholderExtension,
} from 'remirror/extensions'
// import data from 'svgmoji/emoji.json'
import { LineInlineDecorationExtension, LineInlineMarkExtension, markExtensions } from './Inline'
import { LineHeadingExtension } from './Heading'
import { LineParagraphExtension } from './Paragraph'
import { LineTextExtension } from './Text'
import { LineListExtension } from './List'
import { corePreset } from '@remirror/preset-core'
import { LineBlockquoteExtension } from './BlockQuote'
import { LineHardBreakExtension } from './HardBreak'
import { ReactComponentExtension } from '@remirror/react'
import { LineCodeMirrorExtension } from './CodeMirror/codemirror-extension'
import { LineTableExtension, LineTableRowExtension } from './Table'
import { LineHorizontalRuleExtension } from './HorizontalRule'
import { CountExtension } from '@remirror/extension-count'
import { FindExtension } from './Find'
import { LineHtmlBlockExtension } from './HtmlNode/html-block-extension'
import { HtmlImageExtension } from './Image'
import { IframeExtension } from './Iframe'
import { SlashMenuExtension } from './SlashMenu'
import { PlaceholderExtension } from './Placeholder'
import { ClipboardExtension } from './Clipboard'
import { minimalSetup } from './CodeMirror/setup'
import { HtmlBrExtension } from './HtmlBr/br-extension'
import { HtmlInlineNodeExtension } from './HtmlNode/html-inline-node'
import { MermaidBlockExtension } from './Mermaid'
import { ShortcutsExtension } from './Shortcuts/shortcuts-extension'
import { TransformerExtension } from './Transformer/transformer-extension'

// import { TableExtension } from './ReactTables';

export * from './List'

export type ExtensionsOptions = {
  disableAllBuildInShortcuts?: boolean

  handleViewImgSrcUrl?: (src: string) => Promise<string>
}

function extensions(options: ExtensionsOptions): any[] {
  const { handleViewImgSrcUrl } = options

  return [
    ...corePreset({ excludeExtensions: ['paragraph', 'text'] }),
    ...markExtensions({
      handleViewImgSrcUrl,
    }),
    new CountExtension({}),
    new HtmlImageExtension({
      handleViewImgSrcUrl,
    }),
    new HtmlBrExtension(),
    new IframeExtension({
      enableResizing: true,
    }),
    // new LineHtmlInlineExtension({
    //   handleViewImgSrcUrl,
    // }),

    new PlaceholderExtension({ placeholder: 'Type \'/\' for commands' }),
    new LineHorizontalRuleExtension({}),
    new LineParagraphExtension(),
    new LineTextExtension(),
    new LineHardBreakExtension(),
    new LineBlockquoteExtension(),
    new LineHeadingExtension({}),
    new LineListExtension(),
    new LineCodeMirrorExtension({
      extensions: [minimalSetup],
      useProsemirrorHistoryKey: true
    }),
    new LineTableExtension({ resizable: false }),
    new LineTableRowExtension(),
    new LineTableCellExtension(),
    new LineTableHeaderCellExtension(),
    new FindExtension({
      decoration: { style: 'background-color: yellow; color: black' },
      activeDecoration: { style: 'background-color: orange; color: black' },
    }),
    new LineHtmlBlockExtension(),
    new HtmlInlineNodeExtension({
      handleViewImgSrcUrl,
    }),
    new ClipboardExtension(),

    new ReactComponentExtension({}),
    new DropCursorExtension({}),

    new SlashMenuExtension(),
    new LineInlineMarkExtension(),
    new LineInlineDecorationExtension(),

    new MermaidBlockExtension({}),

    new ShortcutsExtension({
      disableAllBuildInShortcuts: options.disableAllBuildInShortcuts,
    }),

    new TransformerExtension({})
  ]
}

export default extensions
