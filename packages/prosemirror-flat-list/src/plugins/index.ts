import type { Schema } from '@remirror/pm/model'
import type { Plugin } from '@remirror/pm/state'

import { createListClipboardPlugin } from './clipboard'
import { createListEventPlugin } from './event'
import { createListRenderingPlugin } from './rendering'
import { createSafariInputMethodWorkaroundPlugin } from './safari-workaround'

/**
 * This function returns an array of plugins that are required for list to work.
 *
 * The plugins are shown below. You can pick and choose which plugins you want
 * to use if you want to customize some behavior.
 *
 * - {@link createListEventPlugin}
 * - {@link createListRenderingPlugin}
 * - {@link createListClipboardPlugin}
 * - {@link createSafariInputMethodWorkaroundPlugin}
 *
 * @public @group Plugins
 */
export function createListPlugins(options: { schema: Schema }): Plugin[] {
  const { schema } = options
  return [
    createListEventPlugin(),
    createListRenderingPlugin(),
    createListClipboardPlugin(schema),
    createSafariInputMethodWorkaroundPlugin(),
  ]
}

export {
  createListClipboardPlugin, createListEventPlugin, createListRenderingPlugin,
  createSafariInputMethodWorkaroundPlugin
}

