import { WysiwygThemeWrapper } from '../../theme'
import { prosemirrorNodeToHtml } from 'remirror'
import { DOMSerializer, type Node } from '@remirror/pm/model'
import { EditorProps } from '../Editor'
import { createWysiwygDelegate } from '../WysiwygEditor'
// @ts-ignore
import HTML from 'html-parse-stringify'
import { useEffect, useState } from 'react'
import { nanoid } from 'nanoid'
import { Loading3QuartersOutlined } from 'zens/esm/Icons'

interface PreviewProps {
  doc: Node | string
  delegateOptions?: EditorProps['delegateOptions']
}

type HTMLAstNode = {
  attrs: Record<string, any>
  name: string
  type: string
  children?: HTMLAstNode[]
}

export const Preview: React.FC<PreviewProps> = (props) => {
  const { doc, delegateOptions } = props
  const [processedHtml, setProcessedHtml] = useState('')
  let targetDoc: PreviewProps['doc'] = doc

  if (typeof targetDoc === 'string') {
    targetDoc = createWysiwygDelegate(delegateOptions).stringToDoc(targetDoc)
  }

  const html = prosemirrorNodeToHtml(targetDoc)

  useEffect(() => {
    const fullAst = HTML.parse(html)

    const imageLoadTasks: Promise<void>[] = []
    const handleHtmlText = async (ast: HTMLAstNode[]) => {
      const handleNode = (node: HTMLAstNode) => {
        if (!node) {
          return
        }

        if (node.name === 'img' && node.attrs?.src && delegateOptions?.handleViewImgSrcUrl) {
          imageLoadTasks.push(
            (async () => {
              node.attrs.src = await delegateOptions?.handleViewImgSrcUrl?.(node.attrs.src)
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
        setProcessedHtml(HTML.stringify(fullAst))
      })
      .catch(() => {
        setProcessedHtml(html)
      })
  }, [html])

  if (!processedHtml) {
    return (
      <div
        style={{
          width: '100%',
          minHeight: '60px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Loading3QuartersOutlined spin size={40} />
      </div>
    )
  }

  return <WysiwygThemeWrapper dangerouslySetInnerHTML={{ __html: processedHtml }} />
}
