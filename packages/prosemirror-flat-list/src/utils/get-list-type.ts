import type { NodeType, Schema } from '@remirror/pm/model'

import { getListTypeName } from './get-list-type-name'

/** @internal */
export function getListType(schema: Schema): NodeType {
  return schema.nodes[getListTypeName(schema)]
}
