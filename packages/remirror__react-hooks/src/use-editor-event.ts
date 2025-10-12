import type { GetHandler, StringKey } from '@rme-sdk/core';
import { EventsExtension, EventsOptions } from '@rme-sdk/extension-events';
import { useExtensionEvent } from '@rme-sdk/react-core';

/**
 * A hook for subscribing to events from the editor.
 */
export function useEditorEvent<Key extends StringKey<GetHandler<EventsOptions>>>(
  event: Key,
  handler: NonNullable<GetHandler<EventsOptions>[Key]>,
): void {
  useExtensionEvent(EventsExtension, event, handler);
}
