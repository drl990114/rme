import { fromInlineMarkdown } from "./from-inline-markdown";
import { describe, it, expect } from 'vitest'

describe('fromInlineMarkdown', () => {
  it('should convert markdown to prosemirror nodes', () => {
    const md = `This is a **bold** text with a [link](https://google.com) and *emphasis*`
    const nodes = fromInlineMarkdown(md)
    expect(nodes).toMatchFileSnapshot('./__snapshots__/from-inline-markdown-1.snap.json')
  })
})
