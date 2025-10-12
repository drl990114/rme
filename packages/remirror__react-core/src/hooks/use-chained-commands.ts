import { AnyExtension, ChainedFromExtensions } from '@rme-sdk/core';

import { useRemirrorContext } from './use-remirror-context';

/**
 * A core hook which provides the chainable commands for usage in your editor.
 *
 * ```tsx
 * import { useChainedCommands } from '@rme-sdk/react';
 *
 * const EditorButton = () => {
 *   const chain = useChainedCommands();
 *
 *   return (
 *     <>
 *       <button onClick={() => chain.toggleBold().toggleItalic().run()}>
 *         Chain me!
 *       </button>
 *     </>
 *   );
 * }
 * ````
 */
export function useChainedCommands<
  Extension extends AnyExtension = Remirror.Extensions | AnyExtension,
>(): ChainedFromExtensions<Extension> {
  return useRemirrorContext<Extension>().chain.new();
}
