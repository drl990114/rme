import type { KeyBindings, KeyBindingsTuple } from '@rme-sdk/core';
import { ExtensionPriority, KeymapExtension } from '@rme-sdk/core';
import { useExtensionCustomEvent } from '@rme-sdk/react-core';
import { useMemo } from 'react';

/**
 * Add custom keyboard bindings to the editor instance.
 *
 * @remarks
 *
 * ```tsx
 * import { Remirror, useRemirror, useRemirrorContext, useKeymaps  } from '@rme-sdk/react';
 *
 * const Editor = () => {
 *   const { manager } = useRemirror({ extensions: () => [] });
 *
 *   return (
 *     <Remirror manager={manager}>
 *       <EditorBindings />
 *     </Remirror>
 *   );
 * };
 *
 * const EditorBindings = () => {
 *   const { getRootProps } = useRemirrorContext({ autoUpdate: true });
 *
 *   useKeymaps({
 *     Enter: () => {
 *       // Prevent the tne enter key from being pressed.
 *       return true;
 *     }
 *   });
 *
 *   return <div {...getRootProps()} />;
 * };
 * ```
 */
export function useKeymaps(bindings: KeyBindings, priority = ExtensionPriority.Medium): void {
  const tuple: KeyBindingsTuple = useMemo(() => [priority, bindings], [priority, bindings]);
  useExtensionCustomEvent(KeymapExtension, 'keymap', tuple);
}
