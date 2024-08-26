import type MarkdownIt from 'markdown-it'
import type { Core, StateCore } from 'markdown-it'
import {
  getAttrsBySignalHtmlContent,
  getTagName,
  isClosingTag,
  isSingleNode,
} from '@/editor/utils/html'
import Token from 'markdown-it/lib/token.mjs'
import { cloneDeep } from 'lodash'
import { HTMLNode } from '../extensions/Inline/from-inline-markdown'
import voidElements from 'void-elements'

export const needSplitInlineHtmlTokenTags = ['img', 'iframe', 'br']

export const excludeHtmlInlineNodes = ['html_inline_node', 'html_image', 'iframe_inline', 'html_br']

const typeMap: Record<string, string> = {
  img: 'html_image',
  iframe: 'iframe_inline',
  br: 'html_br',
}

// function splitHtmlInlineTokens(t: Token) {
//   if (!t.children) return []

//   return t.children.map((child) => {
//     if (
//       isHtmlInlineToken(child) &&
//       needSplitInlineHtmlTokenTags.includes(child.tag) &&
//       !isClosingTag(child.content)
//     ) {
//       const newToken = new Token(typeMap[child.tag], '', 0)
//       newToken.content = child.content
//       newToken.attrs = getAttrsBySignalHtmlContent(child.content)
//       newToken.attrs!.htmlText = newToken.content
//       return newToken
//     } else {
//       const token = new Token('text', '', 0)
//       token.content = child.content
//       return token
//     }
//   })
// }

function getMergeArr(phrasingContents: Token[]) {
  const unCloseedHtmlStack: HTMLNode[] = []
  const mergeArr: HTMLNode[][] = []
  for (let i = 0; i < phrasingContents.length; i++) {
    const phrasingContent = phrasingContents[i]
    if (isHtmlInlineToken(phrasingContent)) {
      const tagName = getTagName(phrasingContent.content)
      const htmlNode = {
        tag: tagName,
        voidElement: !!voidElements[tagName],
        isClosingTag: isClosingTag(phrasingContent.content),
        index: i,
      }

      if (!htmlNode.voidElement) {
        if (!htmlNode.isClosingTag) {
          unCloseedHtmlStack.push(htmlNode)
        } else if (unCloseedHtmlStack[unCloseedHtmlStack.length - 1]?.tag === htmlNode.tag) {
          if (unCloseedHtmlStack.length >= 1) {
            mergeArr.push([unCloseedHtmlStack.pop()!, htmlNode])
            phrasingContent.complete = true
          }
        }
      } else {
        phrasingContent.complete = true
      }
    }
  }

  for (let i = 0; i < mergeArr.length; i++) {
    const merge = mergeArr[i]
    const startIndex = merge[0].index
    const endIndex = merge[1].index
    const parentNode = mergeArr.findIndex(
      (item) => item[0].index < startIndex && item[1].index > endIndex,
    )
    if (parentNode >= 0) {
      mergeArr.splice(i, 1)
      i--
    }
  }

  return mergeArr
}
function mergePhrasingContents(
  phrasingContents: Token[],
  startIndex: number,
  endIndex: number,
): Token[] {
  const merged = new Token('html_inline_node', '', 0)

  for (let i = startIndex; i <= endIndex; i++) {
    merged.content += phrasingContents[i].content || ''
    merged.complete = true
  }

  merged.attrs = {
    htmlText: merged.content,
  }
  phrasingContents.splice(startIndex, endIndex - startIndex + 1, merged)
  return phrasingContents as Token[]
}

function mergeHtmlPhrasingContents(phrasingContents: Token[]) {
  const mergeArr = getMergeArr(phrasingContents)

  let offset = 0
  mergeArr.forEach((merge) => {
    const startIndex = merge[0].index + offset
    const endIndex = merge[1].index + offset
    mergePhrasingContents(phrasingContents, startIndex, endIndex)
    offset += startIndex - endIndex
  })
  phrasingContents.forEach((phrasingContent, index) => {
    if (isHtmlInlineToken(phrasingContent)) {
      const newToken = new Token('html_inline_node', '', 0)
      newToken.content = phrasingContent.content

      newToken.attrs = {
        htmlText: newToken.content,
      }
      phrasingContents.splice(index, 1, newToken)
    }
  })
}

function isInlineToken(t: Token) {
  return t.type === 'inline'
}

function isHtmlInlineToken(t: Token) {
  return t.type === 'html_inline'
}

function isHtmlBlockToken(t: Token) {
  return t.type === 'html_block'
}
// function hasSplitInlineHtmlToken(t: Token) {
//   let res = false

//   t.children?.forEach((child) => {
//     if (isHtmlInlineToken(child)) {
//       const tag = getTagName(child.content)
//       child.tag = tag
//       if (needSplitInlineHtmlTokenTags.includes(child.tag)) {
//         res = true
//       }
//     }
//   })

//   return res
// }

const rule: Core.RuleCore = (state: StateCore) => {
  const edited = false
  const tokens = state.tokens
  const tokensLength = tokens.length
  console.log('tokens', JSON.stringify(tokens))

  for (let i = 0; i <= tokensLength - 1; i++) {
    const curToken = tokens[i]
    if (isInlineToken(curToken)) {
      const newChildren = curToken.children
      if (newChildren) {
        mergeHtmlPhrasingContents(newChildren)
      }
      const newTokens = []
      let childs: Token[] = []
      console.log('newChildren', JSON.stringify(newChildren))
      newChildren?.forEach((child, index) => {
        console.log('indexindex', index, child.type, childs.length)
        if (excludeHtmlInlineNodes.includes(child.type)) {
          if (childs.length > 0) {
            const newToken = new Token('inline', '', 0)
            newToken.children = [...childs]
            newTokens.push(newToken)
            childs.length = 0
          }

          newTokens.push(child)
        } else {
          childs.push(child)
          console.log('indexindex1', childs.length)
        }
      })

      if (childs.length > 0) {
        const newToken = new Token('inline', '', 0)
        newToken.children = childs
        newToken.content = childs.map((child) => child.content).join('')
        newTokens.push(newToken)
        childs = []
      }

      console.log('newTokens', newTokens)
      tokens.splice(i, 1, ...newTokens)
    } else if (isHtmlBlockToken(curToken)) {
      const tag = getTagName(curToken.content)

      if (isSingleNode(curToken.content) && needSplitInlineHtmlTokenTags.includes(tag)) {
        const newToken = new Token(typeMap[tag], '', 0)
        newToken.content = curToken.content
        newToken.attrs = getAttrsBySignalHtmlContent(curToken.content)
        tokens.splice(
          i,
          1,
          ...[new Token('paragraph_open', '', 0), newToken, new Token('paragraph_close', '', 0)],
        )
      }
    }
  }
  console.log('tokens1', JSON.stringify(tokens))

  return edited
}

function MarkdownItHtmlInline(md: MarkdownIt) {
  md.core.ruler.push('markdown-it-html-inline', rule)
}

export default MarkdownItHtmlInline
