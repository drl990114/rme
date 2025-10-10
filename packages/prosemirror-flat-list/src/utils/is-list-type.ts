import type { NodeType } from '@remirror/pm/model'

import { getListTypeName } from './get-list-type-name'

/** @public */
export function isListType(type: NodeType): boolean {
  return getListTypeName(type.schema) === type.name
}
