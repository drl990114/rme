import { getTagName, isClosingTag } from '@/editor/utils/html'
import { fromInlineMarkdown, splitHtmlTokens } from './from-inline-markdown'
import { describe, it, expect } from 'vitest'

describe('fromInlineMarkdown', () => {
  it('should convert markdown to prosemirror nodes', () => {
    const md = `This is a **bold** text with a [link](https://google.com) and *emphasis*`
    const nodes = fromInlineMarkdown(md)
    expect(nodes).toMatchFileSnapshot('./__snapshots__/from-inline-markdown-1.snap.json')
  })
})

const mock: any[] = [
  {
    type: 'html',
    value: '</a >',
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 34, offset: 33 },
    },
  },
  {
    type: 'text',
    value: 'Goo ',
    position: {
      start: { line: 1, column: 34, offset: 33 },
      end: { line: 1, column: 38, offset: 37 },
    },
  },
  {
    type: 'html',
    value: '<mark>',
    position: {
      start: { line: 1, column: 38, offset: 37 },
      end: { line: 1, column: 44, offset: 43 },
    },
  },
  {
    type: 'text',
    value: 'gle',
    position: {
      start: { line: 1, column: 44, offset: 43 },
      end: { line: 1, column: 47, offset: 46 },
    },
  },
  {
    type: 'html',
    value: '</mark>',
    position: {
      start: { line: 1, column: 47, offset: 46 },
      end: { line: 1, column: 54, offset: 53 },
    },
  },
  {
    type: 'html',
    value: '</a>',
    position: {
      start: { line: 1, column: 54, offset: 53 },
      end: { line: 1, column: 57, offset: 57 },
    },
  },
  {
    type: 'html',
    value: '<mark>',
    position: {
      start: { line: 1, column: 38, offset: 37 },
      end: { line: 1, column: 44, offset: 43 },
    },
  },
  {
    type: 'text',
    value: 'gle',
    position: {
      start: { line: 1, column: 44, offset: 43 },
      end: { line: 1, column: 47, offset: 46 },
    },
  },
  {
    type: 'html',
    value: '</mark>',
    position: {
      start: { line: 1, column: 47, offset: 46 },
      end: { line: 1, column: 54, offset: 53 },
    },
  },
]

describe('splitHtml', () => {
  it('should split arr for html tokens', () => {
    const nodes = splitHtmlTokens(mock)
    expect(nodes).toEqual([
      {
        tagName: 'mark',
        attrs: {},
        scope: [2, 4],
      },
      {
        tagName: 'mark',
        attrs: {},
        scope: [6, 8],
      },
    ])
  })
})
