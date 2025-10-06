import type { EditorSchema, ProsemirrorNode } from '@remirror/pm'
import type { Node, Schema } from '@remirror/pm/model'
import type { Transaction } from '@remirror/pm/state'
import { Transform } from '@remirror/pm/transform'
import type { EditorView } from '@remirror/pm/view'

import { excludeHtmlInlineNodes } from '../../transform/markdown-it-html-inline'
import type { MarkChunk } from '../../steps/batch-mark-step'
import { BatchSetMarkStep } from '../../steps/batch-mark-step'
import { iterNode, iterNodeRange } from '../../utils/iter-node'
import { fromInlineMarkdown } from './from-inline-markdown'
import { InlineDecorateType } from './inline-types'

function parseTextBlock(schema: Schema, node: Node, startPos: number, output: MarkChunk[]): void {
  if (!node.textContent) {
    return
  }

  let offsetPoss: number[] = []
  let pos = 0
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i)
    pos += child.nodeSize

    if (excludeHtmlInlineNodes.includes(child.type.name)) {
      offsetPoss.push(pos)
    }
  }
  const tokens = fromInlineMarkdown(node.textContent)

  let totalOffset = 0
  tokens.forEach((token, index) => {
    const expectedMarks = token.marks.map((markName) => {
      return schema.marks[markName].create(token.attrs)
    })

    let start = token.start + totalOffset
    let end = token.end + totalOffset

    const offsetPos = offsetPoss.filter((pos) => pos >= start && pos < end)
    const offset = offsetPos.length

    totalOffset += offset

    // TODO refactor this
    // test case: *mark*<span>`qwe`
    if (output[output.length - 1]?.[1] - 1 === offsetPos[0] && offsetPos.length > 0) {
      output[output.length - 1] = [
        output[output.length - 1][0] + 1,
        output[output.length - 1][1] + 1,
        output[output.length - 1][2],
      ]
    }

    output.push([
      startPos + token.start + totalOffset,
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
