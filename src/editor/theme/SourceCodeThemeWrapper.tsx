import styled, { css } from 'styled-components'

interface WarpperProps {
  codeEditor?: boolean
  dark?: boolean
}

export const SourceCodeThemeWrapper = styled.div.attrs<WarpperProps>((p) => p)`
  width: 100%;
  position: relative;
  white-space: pre-wrap;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  margin: 0;
  font-family: ${(props) => props.theme.fontFamily};
  font-size: ${(props) => props.theme.fontBase};
  line-height: ${(props) => props.theme.lineHeightBase};
  background-color: ${(props) => props.theme.bgColor};
  color: ${(props) => props.theme.primaryFontColor};
  word-wrap: break-word;
  padding-bottom: 1em;
  box-sizing: border-box;
  outline: none;

  .cm-editor {
    margin-bottom: 1em;
    line-height: ${(props) => props.theme.lineHeightBase};
    font-size: ${(props) => props.theme.fontBase};
    font-family: ${(props) => props.theme.codemirrorFontFamily} !important;

    &.cm-focused {
      outline: none;
    }

    .cm-line {
      padding: 2px 2px 2px 6px;

      span {
        line-height: ${(props) => props.theme.lineHeightBase};
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
      background-color: ${(props) => props.theme.bgColor};
    }

    .cm-gutters {
      border: none;
    }

    .cm-gutter.cm-lineNumbers {
      color: ${(props) => props.theme.labelFontColor};
    }
  }

  ${(props) =>
    props.dark &&
    css`
      color-scheme: dark;
    `}
`
