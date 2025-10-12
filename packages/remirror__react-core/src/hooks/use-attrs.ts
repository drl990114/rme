import type { AnyExtension, AttrsFromExtensions } from '@rme-sdk/core';

import { useRemirrorContext } from './use-remirror-context';

/**
 * A core hook which provides the attributes for the nodes and marks in the
 * editor.
 *
 * ```tsx
 * import { useAttrs } from '@rme-sdk/react';
 *
 * const EditorButton = () => {
 *   const attrs = useAttrs();
 *   const { link } = attrs;
 *
 *   return <a href={link.href}>{link().href}</a>;
 * }
 * ```
 */
export function useAttrs<Extension extends AnyExtension = Remirror.Extensions>(
  update = false,
): AttrsFromExtensions<Extension> {
  return useRemirrorContext<Extension>(update ? { autoUpdate: true } : undefined).attrs;
}
