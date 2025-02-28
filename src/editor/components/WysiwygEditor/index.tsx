import { Remirror } from '@remirror/react'
import { type FC, createContext, memo, useMemo, useCallback } from 'react'
import Text from '../Text'
import { WysiwygThemeWrapper } from '../../../editor/theme'
import { createWysiwygDelegate } from './delegate'
import TableToolbar from '../../toolbar/TableToolbar'
import { ProsemirrorDevTools } from '@remirror/dev'
import ErrorBoundary from '../ErrorBoundary'
import type { Extension, RemirrorEventListener } from '@remirror/core'
import { defaultStyleToken, type EditorProps } from '../Editor'
import { SlashMenu } from '../../toolbar/SlashMenu'
import type { DocToString, StringToDoc } from '../../types'

export const wysiwygTransformer: {
  stringToDoc: StringToDoc | null
  docToString: DocToString | null
} = { stringToDoc: null, docToString: null }

const WysiwygEditor: FC<EditorProps> = (props) => {
  const {
    content,
    hooks,
    delegate,
    wysiwygToolBar,
    isTesting,
    editable = true,
    styleToken = defaultStyleToken
  } = props

  const editorDelegate = useMemo(() => delegate ?? createWysiwygDelegate(), [delegate])

  const handleChange: RemirrorEventListener<Extension> = useCallback(
    (params) => {
      try {
        // const textContent = editorDelegate.docToString(params.state.doc)
        props.onChange?.(params)
      } catch (error) {
        console.error(error)
      }
    },
    [editorDelegate, props],
  )

  if (wysiwygTransformer.stringToDoc === null) {
    wysiwygTransformer.stringToDoc = editorDelegate.stringToDoc
    wysiwygTransformer.docToString = editorDelegate.docToString
  }

  let initialContent
  try {
    initialContent = editorDelegate.stringToDoc(content)
  } catch (error) {
    return <ErrorBoundary hasError error={error} {...(props.errorHandler || {})}/>
  }

  return (
    <ErrorBoundary {...(props.errorHandler || {})}>
      <WysiwygThemeWrapper {...styleToken}>
        <Remirror
          manager={editorDelegate.manager}
          initialContent={initialContent}
          hooks={hooks}
          editable={editable}
          onChange={handleChange}
        >
          <Text />
          <TableToolbar />
          <SlashMenu />
          {wysiwygToolBar || null}
          {isTesting ? <ProsemirrorDevTools /> : null}
        </Remirror>
      </WysiwygThemeWrapper>
    </ErrorBoundary>
  )
}

export default memo(WysiwygEditor)
export * from './delegate'
