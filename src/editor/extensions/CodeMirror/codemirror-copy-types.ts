// Type definitions for CodeMirror copy functionality

import type { ProsemirrorNode, EditorView } from '@remirror/pm'

/**
 * Custom copy function signature for CodeMirror extension
 */
export type CustomCopyFunction = (
  code: string,
  node: ProsemirrorNode,
  view: EditorView
) => Promise<boolean> | boolean

