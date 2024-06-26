import type MarkdownIt from "markdown-it"
import type { Core, StateCore } from 'markdown-it'
import Token from 'markdown-it/lib/token.mjs'

function isBulletListItemToken(t: Token) {
    return t.type === "list_item_open" && ["*", "-"].includes(t.markup)
}
function isParagraphOpenToken(t: Token) {
    return t.type === "paragraph_open"
}
function isInlineToken(t: Token) {
    return t.type === "inline"
}

const rule: Core.RuleCore = (state: StateCore) => {
    let edited = false
    const tokens = state.tokens
    const tokensLength = tokens.length
    for (let i = tokensLength - 3; i >= 0; i--) {
        if (isBulletListItemToken(tokens[i]) && isParagraphOpenToken(tokens[i + 1]) && isInlineToken(tokens[i + 2])) {
            const inlineToken = tokens[i + 2]
            const match = /^\[([ |x])\]\s?/.exec(inlineToken.content)
            if (match) {
                const checked = match[1] === "x"
                inlineToken.content = inlineToken.content.slice(match[0].length)
                const checkboxToken = new Token("list_checkbox", "input", 0)
                checkboxToken.attrPush(["type", "checkbox"])
                if (checked) {
                    checkboxToken.attrPush(["checked", ""])
                }
                tokens.splice(i + 1, 0, checkboxToken)
                edited = true
            }
        }
    }
    return edited
}

// A markdown-it plugin for selectable list checkbox
function MarkdownItListCheckbox(md: MarkdownIt) {
    md.core.ruler.push("markdown-it-list-checkbox", rule)
}

export default MarkdownItListCheckbox
