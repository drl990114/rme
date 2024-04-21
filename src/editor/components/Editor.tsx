/* eslint-disable react-hooks/rules-of-hooks */
import WysiwygEditor from './WysiwygEditor'
import SourceEditor from './SourceEditor'
import { forwardRef, memo, useImperativeHandle, useMemo, useState } from 'react'
import {
  Preview,
  type CreateWysiwygDelegateOptions,
  type EditorContext,
  type EditorDelegate,
  type EditorViewType,
} from '../..'
import { useContextMounted } from './useContextMounted'
import type { Extension, RemirrorEventListenerProps } from 'remirror'
import 'prosemirror-flat-list/dist/style.css'

export const Editor = memo(
  forwardRef<EditorRef, EditorProps>((props, ref) => {
    const {
      initialType = 'wysiwyg',
      hooks = [],
      onContextMounted,
      ...otherProps
    } = props
    const [type, setType] = useState<EditorViewType>(initialType)

    useImperativeHandle(ref, () => ({
      getType: () => type,
      toggleType: (targetType: EditorViewType) => {
        setType(targetType)
      },
    }))

    const editorHooks = useMemo(() => {
      return [() => useContextMounted(onContextMounted), ...hooks]
    }, [hooks, onContextMounted])

    if (type === 'preview') {
      return <Preview doc={otherProps.content} delegateOptions={otherProps.delegateOptions} />
    }

    return type === 'sourceCode' ? (
      <SourceEditor {...otherProps} hooks={editorHooks} />
    ) : (
      <WysiwygEditor {...otherProps} hooks={editorHooks} />
    )
  }),
)

export type EditorChangeEventParams = RemirrorEventListenerProps<Extension>
export type EditorChangeHandler = (params: EditorChangeEventParams) => void

export type EditorRef = {
  toggleType: (targetType: EditorViewType) => void
  getType: () => EditorViewType
}

export interface EditorProps {
  initialType?: EditorViewType
  delegate?: EditorDelegate
  content: string
  isTesting?: boolean
  editable?: boolean
  delegateOptions?: CreateWysiwygDelegateOptions
  onChange?: EditorChangeHandler
  hooks?: (() => void)[]
  markdownToolBar?: React.ReactNode[]
  wysiwygToolBar?: React.ReactNode[]
  onContextMounted?: (context: EditorContext) => void
}
