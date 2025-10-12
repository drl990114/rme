import { Selection } from '@rme-sdk/core';

import { useRemirrorContext } from './use-remirror-context';

/**
 * A core hook which returns the current selection.
 */
export function useCurrentSelection(): Selection {
  return useRemirrorContext({ autoUpdate: true }).getState().selection;
}
