import type MarkdownIt from 'markdown-it'
import Token from 'markdown-it/lib/token.mjs'

const rule = (state: any) => {
  let edited = false
  const tokens = state.tokens
  let tokensLength = tokens.length

  for (let i = 0; i <= tokensLength - 1; i++) {
    const curToken = tokens[i] as Token
    let newTokens: Token[] = []

    if (
      curToken.type === 'inline' &&
      curToken.children &&
      curToken.children.some((t) => t.type === 'image')
    ) {
      // If the inline token contains image children, we need to process them
      const inlineTokens = curToken.children
      inlineTokens.forEach((t) => {
        if (t.type === 'image') {
          const src = (t.attrs)?.[0]?.[1] || ''
          const alt = (t.attrs)?.[1]?.[1] || t.content || ''
          const imageToken = new Token('md_image', 'img', 0)
          ;(imageToken as any).attrs = { src, alt }
          newTokens.push(imageToken)
          edited = true
        } else {
          newTokens.push(t)
        }
      })

      // Replace the current inline token with the new tokens
      tokens.splice(i, 1, ...newTokens)
      tokensLength += newTokens.length - 1
      continue
    }
  }

  return edited
}

// Minimal $...$ and $$...$$ tokenizer producing tokens: math_inline and math_block
export default function MarkdownItImage(md: MarkdownIt) {
  md.core.ruler.push('markdown-it-image', rule)
}
