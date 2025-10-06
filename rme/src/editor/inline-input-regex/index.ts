import { NodeType } from '@remirror/pm'

export const getMdImageInputRule = <T extends NodeType | string>(nodeType: T) => [
  {
    regexp: /!\[([^\]]*)\]\(([^\s"]+(?:\s+[^\s"]+)*)?(?:\s+"(.*?)")?\)/,
    type: nodeType,
    getAttributes: (match: string[]) => {
      const [, alt, src, title] = match
      return { alt, src, title }
    },
  },
]

export const getInlineMathInputRule = <T extends NodeType | string>(nodeType: T) => [
  // Typed inline math trigger: $$ -> insert empty inline math and focus inside
  {
    regexp: /\$\$(?!\$)/,
    type: nodeType,
    getAttributes: () => ({ tex: '', fromInput: true }),
  },
  {
    regexp: /<span[^>]*data-type=["']math-inline["'][^>]*><\/span>/,
    type: nodeType,
    getAttributes: () => ({ fromInput: false }),
  },
  {
    regexp: /\$([^$\n]+?)\$/,
    type: nodeType,
    getAttributes: (match: string[]) => {
      return { tex: match[1] ?? '', fromInput: true }
    },
  },
]
