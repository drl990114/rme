import { Remirror } from '@remirror/react'
import { type FC, createContext, memo, useMemo, useCallback } from 'react'
import Text from '../Text'
import { WysiwygThemeWrapper } from '../../../editor/theme'
import { createWysiwygDelegate } from './delegate'
import TableToolbar from '../../toolbar/TableToolbar'
import { ProsemirrorDevTools } from '@remirror/dev'
import ErrorBoundary from '../ErrorBoundary'
import type { Extension, RemirrorEventListener } from '@remirror/core'
import type { EditorProps } from '../Editor'
import { SlashMenu } from '../../toolbar/SlashMenu'
import type { DocToString, StringToDoc } from '../../types'

export const OffsetContext = createContext({ top: 0, left: 0 })

export const wysiwygTransformer: {
  stringToDoc: StringToDoc | null
  docToString: DocToString | null
} = { stringToDoc: null, docToString: null }

const WysiwygEditor: FC<EditorProps> = (props) => {
  const { content, hooks, delegate, offset, wysiwygToolBar, isTesting, editable } = props

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
    return <ErrorBoundary hasError error={error} />
  }

  return (
    <ErrorBoundary>
      <WysiwygThemeWrapper>
        <OffsetContext.Provider value={offset || { top: 0, left: 0 }}>
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
        </OffsetContext.Provider>
      </WysiwygThemeWrapper>
    </ErrorBoundary>
  )
}

WysiwygEditor.defaultProps = {
  editable: true,
}

export default memo(WysiwygEditor)
export * from './delegate'
