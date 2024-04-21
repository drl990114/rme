import type { EditorSchema, ProsemirrorNode } from '@remirror/pm'
import type { Node, Schema } from '@remirror/pm/model'
import type { Transaction } from '@remirror/pm/state'
import { Transform } from '@remirror/pm/transform'
import type { EditorView } from '@remirror/pm/view'

import type { MarkChunk } from '../../steps/batch-mark-step'
import { BatchSetMarkStep } from '../../steps/batch-mark-step'
import { iterNode, iterNodeRange } from '../../utils/iter-node'
import { fromInlineMarkdown } from './from-inline-markdown'
import { InlineDecorateType } from './inline-types'
import { excludeHtmlInlineNodes } from '@/editor/transform/markdown-it-html-inline'

function parseTextBlock(schema: Schema, node: Node, startPos: number, output: MarkChunk[]): void {
  if (!node.textContent) {
    return
  }

  const offsetPoss: number[] = []
  let pos = 0
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i)
    if (excludeHtmlInlineNodes.includes(child.type.name)) {
      offsetPoss.push(pos)
    }
    pos += child.nodeSize
  }
  const tokens = fromInlineMarkdown(node.textContent)

  let totalOffset = 0
  tokens.forEach((token, index) => {
    const expectedMarks = token.marks.map((markName) => {
      return schema.marks[markName].create(token.attrs)
    })

    let start = token.start
    let end = token.end

    const offset = offsetPoss.filter((pos) => pos >= start && pos < end).length

    totalOffset += offset
    output.push([
      startPos + token.start + totalOffset - offset,
      startPos + token.end + totalOffset,
      expectedMarks,
    ])
  })
}

function parseNode(schema: EditorSchema, node: Node, startPos: number, output: MarkChunk[]): void {
  if (node.attrs.inlineDecorateType === InlineDecorateType.Ignore) {
    return
  }

  if (node.isTextblock) {
    parseTextBlock(schema, node, startPos, output)
  } else {
    node.forEach((child: Node, offset: number) => {
      parseNode(schema, child, startPos + offset + 1, output)
    })
  }
}

function updateNodeMarks(tr: Transform, node: Node, startPos: number, output: MarkChunk[]): void {
  if (!node.isTextblock) {
    for (const [child, offset] of iterNode(node)) {
      updateNodeMarks(tr, child, startPos + offset + 1, output)
    }
  } else {
    const schema = tr.doc.type.schema
    parseNode(schema, node, startPos, output)
  }
}

export function initDocMarks(doc: ProsemirrorNode): ProsemirrorNode {
  const tr = new Transform(doc)
  const output: MarkChunk[] = []
  updateNodeMarks(tr, doc, 0, output)
  if (output.length) {
    tr.step(new BatchSetMarkStep(output))
  }
  return tr.doc
}

export function applySelectionMarks(view: EditorView): void {
  if (view.isDestroyed) return

  const tr = view.state.tr
  tr.setMeta('addToHistory', false)
  if (updateRangeMarks(tr)) {
    view.dispatch(tr)
  }
}

export function applyDocMarks(view: EditorView): void {
  if (view.isDestroyed) return

  const tr = view.state.tr
  if (updateRangeMarks(tr, true)) {
    view.dispatch(tr)
  }
}

export function updateRangeMarks(tr: Transaction, forceUpdateAll?: boolean): boolean {
  tr.setMeta('APPLY_MARKS', true)

  const { $from, $to } = tr.selection
  const range = $from.blockRange($to)

  const output: MarkChunk[] = []
  if (!range || forceUpdateAll) {
    updateNodeMarks(tr, tr.doc, 0, output)
  } else {
    for (const [child, pos] of iterNodeRange(range)) {
      updateNodeMarks(tr, child, pos, output)
    }
  }
  if (output.length) {
    tr.step(new BatchSetMarkStep(output))
  }

  if (tr.docChanged) {
    return true
  }
  return false
}
