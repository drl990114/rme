import type { GetHandler, StringKey } from '@rme-sdk/core';
import { HistoryExtension, HistoryOptions } from '@rme-sdk/extension-history';
import { useExtensionEvent } from '@rme-sdk/react-core';

/**
 * A hook which is called every time an undo or redo event is triggered from
 * within the ProseMirror history extension.
 *
 * @remarks
 *
 * `handler` should be a memoized function.
 */
export function useHistory<Key extends StringKey<GetHandler<HistoryOptions>>>(
  event: Key,
  handler: NonNullable<GetHandler<HistoryOptions>[Key]>,
): void {
  useExtensionEvent(HistoryExtension, event, handler);
}
