import styled, { css } from 'styled-components'

interface WarpperProps {
  codeEditor?: boolean
  dark?: boolean
  /**
   * @default 15px
   */
  rootFontSize?: string
  /**
   * @default 1.6
   */
  rootLineHeight?: string
}

export const WysiwygThemeWrapper = styled.div.attrs<WarpperProps>((p) => ({
  rootFontSize: '15px',
  rootLineHeight: '1.6',
  ...p,
}))`
  width: 100%;
  position: relative;
  white-space: pre-wrap;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  margin: 0;
  font-family: ${(props) => props.theme.fontFamily};
  font-size: ${(props) => props.rootFontSize};
  line-height: ${(props) => props.rootLineHeight};
  background-color: ${(props) => props.theme.bgColor};
  color: ${(props) => props.theme.primaryFontColor};
  word-wrap: break-word;
  padding: 0 20px;
  padding-bottom: 1em;
  box-sizing: border-box;
  outline: none;

  & summary {
    display: list-item;
  }

  & a {
    background-color: transparent;
    color: #58a6ff;
    text-decoration: none;
  }

  & b,
  & strong {
    font-weight: 600;
  }

  & dfn {
    font-style: italic;
  }

  & mark {
    background-color: ${(props) => props.theme.markBgColor};
    color: ${(props) => props.theme.markFontColor};
  }

  & small {
    font-size: 0.9em;
  }

  & sub,
  & sup {
    font-size: 0.75em;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
  }

  & sub {
    bottom: -0.25em;
  }

  & sup {
    top: -0.5em;
  }

  & img {
    border-style: none;
    max-width: 100%;
    box-sizing: content-box;
    background-color: ${(props) => props.theme.imgBgColor};
  }

  & hr {
    border-bottom: 1px solid ${(props) => props.theme.hrBorderColor};
    background-color: ${(props) => props.theme.hrBgColor};
  }

  & kbd {
    display: inline-block;
    padding: 3px 5px;
    font:
      11px ui-monospace,
      SFMono-Regular,
      SF Mono,
      Menlo,
      Consolas,
      Liberation Mono,
      monospace;
    line-height: 10px;
    color: ${(props) => props.theme.kbdFontColor};
    vertical-align: middle;
    background-color: ${(props) => props.theme.kbdBgColor};
    border: solid 1px ${(props) => props.theme.kbdBorderColor};
    border-radius: 6px;
  }

  & blockquote {
    color: ${(props) => props.theme.blockquoteFontColor};
    border-left: 0.25em solid ${(props) => props.theme.blockquoteBorderColor};
  }

  & table th,
  & table td {
    position: relative;
    border: 1px solid ${(props) => props.theme.tableTdBorderColor};
  }

  & table tr {
    background-color: ${(props) => props.theme.tableTrBgColor};
    border-top: 1px solid ${(props) => props.theme.tableTrBorderColor};
  }

  & table tr:nth-child(2n) {
    background-color: ${(props) => props.theme.tableTrDeepBgColor};
  }

  & code,
  & tt {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 0.85em;
    white-space: break-spaces;
    background-color: ${(props) => props.theme.codeBgColor};
    border-radius: 6px;
  }

  & code,
  & kbd,
  & pre,
  & samp {
    font-family: monospace;
    font-size: 1em;
  }

  & figure {
    margin: 1em 40px;
  }

  & hr {
    box-sizing: content-box;
    overflow: hidden;
    background: transparent;
    border-bottom: 1px solid #21262d;
    height: 0.25em;
    padding: 0;
    margin: 24px 0;
    background-color: #30363d;
    border: 0;
  }

  & input {
    font: inherit;
    margin: 0;
    overflow: visible;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  & a:hover {
    text-decoration: underline;
  }

  & hr::before {
    display: table;
    content: '';
  }

  & hr::after {
    display: table;
    clear: both;
    content: '';
  }

  & table {
    position: relative;
    border-spacing: 0;
    border-collapse: collapse;
    display: block;
    width: max-content;
    max-width: 100%;
    overflow: auto;
    margin: 1em 0;
  }

  & td,
  & th {
    padding: 0;
  }


  & input[type='checkbox'] {
    /* Add if not using autoprefixer */
    -webkit-appearance: none;
    /* Remove most all native input styles */
    appearance: none;
    /* Not removed via appearance */
    margin: 0;

    font: inherit;
    color: currentColor;
    width: 1.15em;
    height: 1.15em;
    border: 1px solid currentColor;
    border-radius: 4px;
    transform: translateY(0.25em);

    display: grid;
    place-content: center;
  }

  & input[type='checkbox']:checked {
    background-color: ${props => props.theme.accentColor};
  }

  & input[type='checkbox']:checked::before {
    transform: scale(1);
  }

  & input[type='checkbox']::before {
    content: '';
    width: 0.75em;
    height: 0.75em;
    clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
    transform: scale(0);
    transform-origin: bottom left;
    transition: 120ms transform ease-in-out;
    /* Windows High Contrast Mode */
    background-color: CanvasText;
  }

  & input[type='checkbox']:focus {
    outline: max(2px, 0.15em) solid currentColor;
    outline-offset: max(2px, 0.15em);
  }

  & input[type='checkbox']:disabled {
    --form-control-color: #eee;

    color: #eee;
    cursor: not-allowed;
  }

  & a:focus,
  & [role='button']:focus,
  & input[type='radio']:focus,
  & input[type='checkbox']:focus {
    outline: 2px solid #58a6ff;
    outline-offset: -2px;
    box-shadow: none;
  }

  & a:focus:not(:focus-visible),
  & [role='button']:focus:not(:focus-visible),
  & input[type='radio']:focus:not(:focus-visible),
  & input[type='checkbox']:focus:not(:focus-visible) {
    outline: solid 1px transparent;
  }

  & a:focus-visible,
  & [role='button']:focus-visible,
  & input[type='radio']:focus-visible,
  & input[type='checkbox']:focus-visible {
    outline: 2px solid #58a6ff;
    outline-offset: -2px;
    box-shadow: none;
  }

  & a:not([class]):focus,
  & a:not([class]):focus-visible,
  & input[type='radio']:focus,
  & input[type='radio']:focus-visible,
  & input[type='checkbox']:focus,
  & input[type='checkbox']:focus-visible {
    outline-offset: 0;
  }

  & h1,
  & h2,
  & h3,
  & h4,
  & h5,
  & h6 {
    position: relative;
    margin: 0;
    line-height: 1;
  }

  & h1 {
    font-weight: 600;
    margin: 10px 0 20px 0;
    font-size: 1.87em;
  }

  & h2 {
    font-weight: 600;
    margin: 10px 0 20px 0;
    font-size: 1.75em;
  }

  & h3 {
    font-weight: 600;
    margin: 10px 0 20px 0;
    font-size: 1.6em;
  }

  & h4 {
    font-weight: 600;
    margin: 10px 0 20px 0;
    font-size: 1.46em;
  }

  & h5 {
    font-weight: 600;
    margin: 6px 0 16px 0;
    font-size: 1.3em;
  }

  & h6 {
    font-weight: 600;
    margin: 6px 0 16px 0;
    font-size: 1.2em;
  }

  & p {
    margin-top: 0;
    margin-bottom: 10px;
  }

  & blockquote {
    margin: 0;
    padding: 0 1em;
    color: #8b949e;
    border-left: 0.25em solid #30363d;
  }

  & ul,
  & ol {
    margin-top: 0;
    margin-bottom: 0;
    padding-left: 2em;
  }

  & ol ol,
  & ul ol {
    list-style-type: lower-roman;
  }

  & ul ul ol,
  & ul ol ol,
  & ol ul ol,
  & ol ol ol {
    list-style-type: lower-alpha;
  }

  & dd {
    margin-left: 0;
  }

  & tt,
  & code,
  & samp {
    font-family:
      ui-monospace,
      SFMono-Regular,
      SF Mono,
      Menlo,
      Consolas,
      Liberation Mono,
      monospace;
    font-size: 0.8em;
  }

  & pre {
    margin-top: 0;
    margin-bottom: 0;
    font-family:
      ui-monospace,
      SFMono-Regular,
      SF Mono,
      Menlo,
      Consolas,
      Liberation Mono,
      monospace;
    font-size: 0.8em;
    word-wrap: normal;
  }

  .markdown-body::before {
    display: table;
    content: '';
  }

  .markdown-body::after {
    display: table;
    clear: both;
    content: '';
  }

  & > *:first-child {
    margin-top: 0 !important;
  }

  & > *:last-child {
    margin-bottom: 0 !important;
  }

  & a:not([href]) {
    color: inherit;
    text-decoration: none;
  }

  & p,
  & blockquote,
  & ul,
  & ol,
  & dl,
  & pre,
  & details {
    margin-top: 0;
    margin-bottom: 16px;
  }

  & blockquote > :first-child {
    margin-top: 0;
  }

  & blockquote > :last-child {
    margin-bottom: 0;
  }

  & h1 tt,
  & h1 code,
  & h2 tt,
  & h2 code,
  & h3 tt,
  & h3 code,
  & h4 tt,
  & h4 code,
  & h5 tt,
  & h5 code,
  & h6 tt,
  & h6 code {
    padding: 0 0.2em;
    font-size: inherit;
  }

  & ul ul,
  & ul ol,
  & ol ol,
  & ol ul {
    margin-top: 0;
    margin-bottom: 0;
  }

  & li > p {
    margin-top: 16px;
  }

  & li + li {
    margin-top: 0.25em;
  }

  & dl {
    padding: 0;
  }

  & dl dt {
    padding: 0;
    margin-top: 16px;
    font-size: 1em;
    font-style: italic;
    font-weight: 600;
  }

  & dl dd {
    padding: 0 16px;
    margin-bottom: 16px;
  }

  & table th {
    font-weight: 600;
  }

  & table th,
  & table td {
    min-width: 60px;
    padding: 6px 20px;
  }

  & table img {
    background-color: transparent;
  }

  & img[align='right'] {
    padding-left: 20px;
  }

  & img[align='left'] {
    padding-right: 20px;
  }

  & code,
  & tt {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 0.85em;
    white-space: break-spaces;
    background-color: rgba(110, 118, 129, 0.4);
    border-radius: 6px;
  }

  & code br,
  & tt br {
    display: none;
  }

  & del code {
    text-decoration: inherit;
  }

  & samp {
    font-size: 0.85em;
  }

  & pre code {
    font-size: 1em;
  }

  & pre > code {
    padding: 0;
    margin: 0;
    word-break: normal;
    white-space: pre;
    background: transparent;
    border: 0;
  }

  & pre {
    padding: 16px;
    overflow: auto;
    font-size: 0.85em;
    line-height: 1.45;
    background-color: ${(props) => props.theme.preBgColor};
    border-radius: 6px;
  }

  & pre code,
  & pre tt {
    display: inline;
    max-width: auto;
    padding: 0;
    margin: 0;
    overflow: visible;
    line-height: inherit;
    word-wrap: normal;
    background-color: transparent;
    border: 0;
  }

  & ul[data-task-list] {
    padding: 0;
    list-style-type: none;
  }

  .remirror-list-item-with-custom-mark {
    display: flex;
  }

  .remirror-list-item-marker-container {
    margin-right: 0.5em;
  }

  & h1 .show {
    font-size: 2rem;
  }

  & h2 .show {
    font-size: 1.5rem;
  }
  & h3 .show {
    font-size: 1.25rem;
  }

  & h4 .show {
    font-size: 1rem;
  }

  & h5 .show {
    font-size: 0.875rem;
  }

  & h6 .show {
    font-size: 0.85rem;
  }

  & .md-img-uri,
  & .md-img-text,
  & .md-link {
    font-size: 0;
    letter-spacing: 0;
  }

  & .md-html-inline {
    letter-spacing: 0;
    font-size: 0;
    background-color: ${(props) => props.theme.tipsBgColor};
    color: ${(props) => props.theme.labelFontColor};
  }

  .md-mark {
    color: ${(props) => props.theme.accentColor};
    font-size: 0;
  }

  .html_tag {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 0.85em;
    white-space: break-spaces;
    background-color: ${(props) => props.theme.codeBgColor};
    border-radius: 6px;
  }

  .show {
    font-size: ${props => props.rootFontSize};
  }

  & .cm-editor {
    height: auto;
    overflow: auto;
    font-size: 0.85em;
    line-height: 1.45;
    background-color: ${(props) => props.theme.bgColor};
    border: 1px solid ${(props) => props.theme.borderColor};
  }

  .cm-editor.cm-focused {
    outline: none; // override the default outline
  }

  & .code-block__reference {
    position: relative;
    padding: 4px 1em;
    font-size: 0.8em;
    border: 1px solid ${(props) => props.theme.borderColor};
    background-color: ${(props) => props.theme.tipsBgColor};

    &--active {
      border-bottom: none;
    }
  }

  & .code-block__languages {
    position: absolute;
    font-size: 1em;
    max-height: 180px;
    list-style: none;
    padding: 0;
    margin: 0;
    width: 160px;
    background-color: ${(props) => props.theme.bgColor};
    border: 1px solid ${(props) => props.theme.borderColor};
    overflow: auto;
    box-sizing: border-box;
    z-index: 100;
    box-shadow:
      0 1px 4px -2px ${(props) => props.theme.boxShadowColor},
      0 2px 8px 0 ${(props) => props.theme.boxShadowColor},
      0 8px 16px 4px ${(props) => props.theme.boxShadowColor};

    &__input {
      height: 100%;
      width: 160px;
      outline: none;
      color: ${(props) => props.theme.accentColor};
      font-weight: 900;
      background-color: transparent;
      box-sizing: border-box;
      border: none;
    }
  }

  & .code-block__language {
    padding: 0.5em 1em;
    font-size: 1em;
    cursor: pointer;
    transition: all 0.3s;

    &--active {
      background-color: ${(props) => props.theme.borderColor};
    }

    &:hover {
      background-color: ${(props) => props.theme.tipsBgColor};
    }
  }

  .remirror-is-empty {
    color: ${(props) => props.theme.labelFontColor};
  }

  .node-hide {
    display: none !important;
  }

  .node-show {
    display: block;
    transition: all 0.3s;
  }

  .html-node {
    position: relative;
    min-height: 40px;
    transition: all 0.3s;

    &:hover {
      background-color: ${({ theme }) => theme.tipsBgColor};
    }
  }

  .html-src {
    outline: none;
  }

  & .ProseMirror-focused {
    outline: 2px solid ${(props) => props.theme.accentColor};
  }

  .img-input__container {
    display: flex;
  }

  .html-node-label {
    position: absolute;
    right: 0;
    opacity: 0;
    transition: all 0.3s;
    font-size: small;
    cursor: pointer;
    color: ${(props) => props.theme.labelFontColor};
  }

  .node-enter {
    & .html-node-render {
      background-color: ${({ theme }) => theme.tipsBgColor};
    }

    & .html-node-label {
      opacity: 1;
      background-color: ${({ theme }) => theme.tipsBgColor};
    }
  }

  .cm-editor {
    margin-bottom: 1em;
    line-height: ${(props) => props.rootLineHeight};
    font-size: ${(props) => props.rootFontSize};
    font-family: ${(props) => props.theme.codemirrorFontFamily} !important;

    .cm-line {
      padding: 2px 2px 2px 6px;

      span {
        line-height: ${(props) => props.rootLineHeight};
      }
    }

    .cm-content {
      background-color: ${(props) => props.theme.bgColor};
    }
    .cm-scroller .cm-gutters {
      background-color: ${(props) => props.theme.bgColor};
    }
    .cm-lineNumbers .cm-gutterElement {
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: ${(props) => props.theme.bgColor};
    }

    .cm-gutters {
      border: none;
    }

    .cm-gutter.cm-lineNumbers {
      color: ${(props) => props.theme.labelFontColor};
    }
  }

  .remirror-is-empty::before {
    position: absolute;
    pointer-events: none;
    height: 0;
    content: attr(data-placeholder);
  }

  .remirror-editor {
    /* height: 100%; */
    outline: none;
  }

  .cm-editor {
    height: 100%;
  }

  .remirror-floating-popover {
    /* padding: var(--rmr-space-2); */
    padding: 0;
    border: none;
    max-height: calc(100vh - 56px);
  }

  .remirror-positioner {
    position: absolute;
    min-width: 1px;
    min-height: 1px;
    pointer-events: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    cursor: none;
    z-index: -1;
  }

  .remirror-positioner-widget {
    width: 0;
    height: 0;
    position: absolute;
  }

  .remirror-emoji-wrapper img {
    width: 1em;
    vertical-align: middle;
    background-color: transparent;
  }

  & .html-image-node-view-wrapper {
    display: inline-block;

    &:hover {
      outline: 2px solid #58a6ff;
      transition: all 300ms ease-in 0s;
    }
  }

  & .ProseMirror-selectednode {
    outline: 2px solid #58a6ff;
  }

  & .ProseMirror th.selectedCell,
  & .ProseMirror td.selectedCell {
    border-style: double;
    border-color: ${(props) => props.theme.tableSelectorCellBorderColor};
    background-color: ${(props) => props.theme.tableSelectorCellBgColor};
  }

  & .ProseMirror .tableWrapper {
    overflow: visible;
  }

  & .ProseMirror table {
    overflow: visible;

    .rme-table-selector {
      cursor: pointer;

      outline-color: ${(props) => props.theme.tableSelectorBorderColor};
      outline-style: solid;
      outline-width: 1px;

      background-color: ${(props) => props.theme.tableSelectorBgColor};

      &:hover {
        background-color: ${(props) => props.theme.tableSelectorBgColor};
      }
    }

    .rme-table-selector-highlight {
      outline-color: ${(props) => props.theme.tableSelectorHightBorderColor};
      background-color: ${(props) => props.theme.tableSelectorHightColor};

      &:hover {
        background-color: ${(props) => props.theme.tableSelectorHightHoverColor};
      }
    }

    .rme-table-body-selector {
      position: absolute;
      width: 14px;
      height: 14px;
      top: -15px;
      left: -15px;
    }

    .rme-table-row-selector {
      position: absolute;
      width: 14px;
      top: 0;
      bottom: 0;
      left: -15px;
    }

    .rme-table-column-selector {
      position: absolute;
      height: 14px;
      left: 0;
      right: 0;
      top: -15px;
    }
  }

  .prosemirror-flat-list {
    padding: 0;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 32px;
    margin-bottom: 0;
    position: relative;
    display: list-item;
    list-style: none;
  }
  .prosemirror-flat-list.ProseMirror-selectednode {
    outline: none;
  }
  .prosemirror-flat-list.ProseMirror-selectednode:after {
    content: '';
    position: absolute;
    left: -32px;
    right: -2px;
    top: -2px;
    bottom: -2px;
    border: 2px solid #8cf;
    pointer-events: none;
  }
  .prosemirror-flat-list[data-list-kind='bullet'] {
    list-style: disc;
  }
  .prosemirror-flat-list[data-list-kind='ordered'] {
    counter-increment: prosemirror-flat-list-counter;
  }
  .prosemirror-flat-list[data-list-kind='ordered'] > * {
    contain: style;
  }
  .prosemirror-flat-list[data-list-kind='ordered']::before {
    position: absolute;
    right: 100%;
    font-variant-numeric: tabular-nums;
    content: counter(prosemirror-flat-list-counter, decimal) '. ';
  }
  .prosemirror-flat-list[data-list-kind='ordered']:first-child,
  :not(.prosemirror-flat-list[data-list-kind='ordered'])
    + .prosemirror-flat-list[data-list-kind='ordered'] {
    counter-reset: prosemirror-flat-list-counter;
  }

  @supports (counter-set: prosemirror-flat-list-counter 1) {
    [data-list-order]:is(
        .prosemirror-flat-list[data-list-kind='ordered']:first-child,
        :not(.prosemirror-flat-list[data-list-kind='ordered'])
          + .prosemirror-flat-list[data-list-kind='ordered']
      ) {
      counter-set: prosemirror-flat-list-counter var(--prosemirror-flat-list-order);
    }
  }
  @supports not (counter-set: prosemirror-flat-list-counter 1) {
    [data-list-order]:is(
        .prosemirror-flat-list[data-list-kind='ordered']:first-child,
        :not(.prosemirror-flat-list[data-list-kind='ordered'])
          + .prosemirror-flat-list[data-list-kind='ordered']
      ) {
      counter-increment: prosemirror-flat-list-counter var(--prosemirror-flat-list-order);
    }
  }

  .prosemirror-flat-list[data-list-kind='task'] > .list-marker {
    position: absolute;
    right: 100%;
    text-align: center;
    width: 1.5em;
    width: 1lh;
  }
  .prosemirror-flat-list[data-list-kind='task'] > .list-marker,
  .prosemirror-flat-list[data-list-kind='task'] > .list-marker * {
    cursor: pointer;
  }
  .prosemirror-flat-list[data-list-kind='toggle'] > .list-marker {
    position: absolute;
    right: 100%;
    text-align: center;
    width: 1.5em;
    width: 1lh;
  }

  .prosemirror-flat-list[data-list-kind='toggle'] > .list-marker::before {
    content: '\\23f7';
  }
  .prosemirror-flat-list[data-list-kind='toggle'][data-list-collapsable][data-list-collapsed]
    > .list-marker::before {
    content: '\\23f5';
  }
  .prosemirror-flat-list[data-list-kind='toggle'][data-list-collapsable] > .list-marker {
    cursor: pointer;
  }
  .prosemirror-flat-list[data-list-kind='toggle']:not([data-list-collapsable]) > .list-marker {
    opacity: 40%;
    pointer-events: none;
  }
  .prosemirror-flat-list[data-list-kind='toggle'][data-list-collapsable][data-list-collapsed]
    > .list-content
    > *:nth-child(n + 2) {
    display: none;
  }

  ${(props) =>
    props.dark &&
    css`
      color-scheme: dark;
    `}

  ${(props) => {
    const style = css`
      position: absolute;
      left: -20px;
      height: 100%;
      display: flex;
      align-items: center;
      font-size: 12px;
      font-weight: normal;
      color: ${props.theme.primaryFontColor};
    `
    return css`
      & h1 {
        &::before {
          content: 'h1';
          ${style}
        }
      }
      & h2 {
        &::before {
          content: 'h2';
          ${style}
        }
      }
      & h3 {
        &::before {
          content: 'h3';
          ${style}
        }
      }
      & h4 {
        &::before {
          content: 'h4';
          ${style}
        }
      }
      & h5 {
        &::before {
          content: 'h5';
          ${style}
        }
      }
      & h6 {
        &::before {
          content: 'h6';
          ${style}
        }
      }
    `
  }}
`
