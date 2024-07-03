import { Remirror } from '@remirror/react'
import { createContextState } from 'create-context-state'
import React, { memo, useCallback, useMemo } from 'react'
import Text from '../Text'
import type { EditorDelegate } from '../../types'
import { ProsemirrorDevTools } from '@remirror/dev'
import { createSourceCodeDelegate } from './delegate'
import ErrorBoundary from '../ErrorBoundary'
import { defaultStyleToken, type EditorProps } from '../Editor'
import type { Extension, RemirrorEventListener } from 'remirror'
import { SourceCodeThemeWrapper } from '../../theme'

type Context = Props

type Props = {
  markText: EditorDelegate
} & Partial<EditorProps>

const [SourceEditorProvider, useSourceCodeEditor] = createContextState<Context, Props>(
  ({ props }) => {
    return {
      ...props,
    }
  },
)

const SourceCodeEditorCore = memo(
  (props: {
    styleToken?: EditorProps['styleToken']
    markdownToolBar?: React.ReactNode[]
    onChange: RemirrorEventListener<Extension>
  }) => {
    const { markdownToolBar, styleToken } = props
    const { content, markText, hooks, isTesting, editable } = useSourceCodeEditor()

    let initialCntent

    try {
      initialCntent = markText.stringToDoc(content!)
    } catch (error) {
      return <ErrorBoundary hasError error={error} />
    }

    return (
      <ErrorBoundary>
        <SourceCodeThemeWrapper {...styleToken}>
          <Remirror
            manager={markText.manager}
            initialContent={initialCntent}
            hooks={hooks}
            editable={editable}
            onChange={props.onChange}
          >
            <Text />
            {markdownToolBar || null}
            {isTesting ? <ProsemirrorDevTools /> : null}
          </Remirror>
        </SourceCodeThemeWrapper>
      </ErrorBoundary>
    )
  },
)

/**
 * The editor which is used to create the annotation. Supports formatting.
 */
const SourceEditor: React.FC<EditorProps> = (props) => {
  const {
    content,
    delegate,
    isTesting,
    hooks,
    markdownToolBar,
    styleToken = defaultStyleToken,
  } = props

  const editorDelegate = useMemo(() => delegate ?? createSourceCodeDelegate(), [delegate])

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

  return (
    <SourceEditorProvider
      content={content}
      isTesting={isTesting}
      markText={editorDelegate}
      hooks={hooks}
    >
      <SourceCodeEditorCore
        styleToken={styleToken}
        markdownToolBar={markdownToolBar}
        onChange={handleChange}
      />
    </SourceEditorProvider>
  )
}

export default memo(SourceEditor)

export * from './delegate'
