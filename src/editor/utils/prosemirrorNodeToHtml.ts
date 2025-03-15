// @ts-ignore
import HTML from 'html-parse-stringify'
import { prosemirrorNodeToHtml } from 'remirror'
import { HTMLAstNode } from '../components/Preview'
import { type Node } from '@remirror/pm/model'
import { nanoid } from 'nanoid'
import mermaid from 'mermaid'
import { EditorProps } from '../components'

export const handlerByAdditions: Record<
  string,
  {
    checker: (node: HTMLAstNode, delegateOptions: EditorProps['delegateOptions']) => boolean
    handler: (node: HTMLAstNode, delegateOptions: EditorProps['delegateOptions']) => Promise<void>
  }[]
> = {
  img: [
    {
      checker: (node: HTMLAstNode, delegateOptions: EditorProps['delegateOptions']) => {
        return node.name === 'img' && node.attrs?.src && delegateOptions?.handleViewImgSrcUrl
      },
      handler: async (node: HTMLAstNode, delegateOptions: EditorProps['delegateOptions']) => {
        node.attrs.src = await delegateOptions?.handleViewImgSrcUrl?.(node.attrs.src)
        node.attrs.key = nanoid()
      },
    },
  ],
  pre: [
    {
      checker: (node: HTMLAstNode) => {
        return node.attrs['data-type'] === 'mermaid'
      },
      handler: async (node: HTMLAstNode, delegateOptions: EditorProps['delegateOptions']) => {
        let textContent = node.children?.[0]?.content || ''

        const dom = document.createElement('div')
        dom.innerHTML = textContent
        textContent = dom.textContent || ''

        const res = await mermaid.render(
          `mermaid_${previewMermaidRenderCount.count++}`,
          textContent,
        )
        const svgAst = HTML.parse(res.svg)

        node.name = 'div'
        node.attrs = {
          key: nanoid(),
        }
        node.children = svgAst
      },
    },
  ],
}

const previewMermaidRenderCount = { count: 0 }

export const rmeProsemirrorNodeToHtml = async (
  doc: Node,
  delegateOptions: EditorProps['delegateOptions'],
) => {
  const html = prosemirrorNodeToHtml(doc)
  const fullAst = HTML.parse(html)

  const imageLoadTasks: Promise<void>[] = []
  const handleHtmlText = (ast: HTMLAstNode[]) => {
    const handleNode = (node: HTMLAstNode) => {
      if (!node) {
        return
      }
      const handlerByAddition = handlerByAdditions[node.name]

      if (handlerByAddition) {
        for (const handler of handlerByAddition) {
          if (handler.checker(node, delegateOptions)) {
            imageLoadTasks.push(handler.handler(node, delegateOptions))
          }
        }
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

  try {
    await Promise.all(imageLoadTasks)
    return HTML.stringify(fullAst)
  } catch (error) {
    return html
  }
}
