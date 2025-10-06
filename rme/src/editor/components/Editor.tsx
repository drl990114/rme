/* eslint-disable react-hooks/rules-of-hooks */
import { type Node } from '@remirror/pm/model'
import { forwardRef, memo, useImperativeHandle, useMemo, useState } from 'react'
import { prosemirrorNodeToHtml, type Extension, type RemirrorEventListenerProps } from 'remirror'
import {
  EditorViewType,
  HTMLAstNode,
  Preview,
  WysiwygToolbarProps,
  type CreateWysiwygDelegateOptions,
  type EditorContext,
  type EditorDelegate,
} from '../..'
import SourceEditor from './SourceEditor'
import { useContextMounted } from './useContextMounted'
import WysiwygEditor, { createWysiwygDelegate } from './WysiwygEditor'
// @ts-ignore
import HTML from 'html-parse-stringify'
import { nanoid } from 'nanoid'
import { ErrorBoundaryProps } from './ErrorBoundary'

export const Editor = memo(
  forwardRef<EditorRef, EditorProps>((props, ref) => {
    const {
      initialType = EditorViewType.WYSIWYG,
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
      exportHtml: async () => {
        return new Promise<string>((resolve) => {
          let targetDoc: Node | string = otherProps.content

          if (typeof targetDoc === 'string') {
            targetDoc = createWysiwygDelegate(otherProps.delegateOptions).stringToDoc(targetDoc)
          }

          const html = prosemirrorNodeToHtml(targetDoc)

          const fullAst = HTML.parse(html)

          const imageLoadTasks: Promise<void>[] = []
          const handleHtmlText = async (ast: HTMLAstNode[]) => {
            const handleNode = (node: HTMLAstNode) => {
              if (!node) {
                return
              }

              if (
                node.name === 'img' &&
                node.attrs?.src &&
                otherProps.delegateOptions?.handleViewImgSrcUrl
              ) {
                imageLoadTasks.push(
                  (async () => {
                    node.attrs.src = await otherProps.delegateOptions?.handleViewImgSrcUrl?.(
                      node.attrs.src,
                    )
                    node.attrs.key = nanoid()
                  })(),
                )
              }

              if (node.children) {
                handleHtmlText(node.children)
              }
            }

            for (let i = 0; i < ast.length; i++) {
              handleNode(ast[i])
            }
          }

          handleHtmlText(fullAst)
          Promise.all(imageLoadTasks)
            .then((res) => {
              resolve(HTML.stringify(fullAst))
            })
            .catch(() => {
              resolve(html)
            })
        })
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
  exportHtml: () => Promise<string>
}

export const defaultStyleToken = {
  rootFontSize: '15px',
  rootLineHeight: '1.6',
}

export interface EditorProps {
  initialType?: EditorViewType
  delegate?: EditorDelegate
  styleToken?: {
    /**
     * @default 15px
     */
    rootFontSize?: string
    /**
     * @default 1.6
     */
    rootLineHeight?: string
  }
  content: string
  isTesting?: boolean
  editable?: boolean
  delegateOptions?: CreateWysiwygDelegateOptions
  onChange?: EditorChangeHandler
  hooks?: (() => void)[]
  markdownToolBar?: React.ReactNode[]
  wysiwygToolBar?: React.ReactNode[]
  wysiwygToolBarOptions?: {
    enable?: boolean
    compProps?: WysiwygToolbarProps
  }
  onContextMounted?: (context: EditorContext) => void
  errorHandler?: Pick<ErrorBoundaryProps, 'onError' | 'fallback'>
}
