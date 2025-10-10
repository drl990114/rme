/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import type { Fragment } from '@remirror/pm/model'

export function cutByIndex(
  fragment: Fragment,
  from: number,
  to: number,
): Fragment {
  // @ts-expect-error fragment.cutByIndex is internal API
  return fragment.cutByIndex(from, to)
}
