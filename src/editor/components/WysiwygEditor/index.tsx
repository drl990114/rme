import { Remirror } from '@remirror/react'
import { type FC, createContext, memo, useMemo, useCallback, useEffect } from 'react'
import Text from '../Text'
import { WysiwygThemeWrapper } from '../../../editor/theme'
import { createWysiwygDelegate } from './delegate'
import TableToolbar from '../../toolbar/TableToolbar'
import { ProsemirrorDevTools } from '@remirror/dev'
import ErrorBoundary from '../ErrorBoundary'
import type { Extension, RemirrorEventListener } from '@remirror/core'
import { defaultStyleToken, type EditorProps } from '../Editor'
import { SlashMenu } from '../../toolbar/SlashMenu'
import { TransformerExtension } from '../../extensions/Transformer/transformer-extension'

const WysiwygEditor: FC<EditorProps> = (props) => {
  const {
    content,
    hooks,
    delegate,
    wysiwygToolBar,
    isTesting,
    editable = true,
    styleToken = defaultStyleToken,
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

  useEffect(() => {
    const ext = editorDelegate.manager.getExtension(TransformerExtension)

    editorDelegate.manager.view.dispatch(
      editorDelegate.manager.view.state.tr.setMeta(ext.pluginKey, {
        stringToDoc: editorDelegate.stringToDoc,
        docToString: editorDelegate.docToString,
      }),
    )
  }, [editorDelegate])

  let initialContent
  try {
    initialContent = editorDelegate.stringToDoc(content)
  } catch (error) {
    return <ErrorBoundary hasError error={error} {...(props.errorHandler || {})} />
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
