import type { Attrs, Node } from '@rme-sdk/pm/model'

/**
 * All default list node kinds.
 *
 * @public  Schema
 */
export type ListKind = 'bullet' | 'ordered' | 'task' | 'toggle'

/**
 * @public  Schema
 */
export interface ListAttributes {
  kind?: string
  order?: number | null
  checked?: boolean
  collapsed?: boolean
}

/**
 * @public  Schema
 */
export interface ProsemirrorNodeJSON {
  type: string
  marks?: Array<{ type: string; attrs?: Attrs } | string>
  text?: string
  content?: ProsemirrorNodeJSON[]
  attrs?: Attrs
}

export type { Node as ProsemirrorNode }
