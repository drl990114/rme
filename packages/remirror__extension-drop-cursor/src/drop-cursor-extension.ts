import { extension, PlainExtension, ProsemirrorPlugin } from '@rme-sdk/core'
import { dropCursor } from '@rme-sdk/pm/dropcursor'

export interface DropCursorOptions {
  /**
   * Set the color of the cursor.
   *
   * @defaultValue 'black'
   */
  color?: string

  /**
   * Set the precise width of the cursor in pixels.
   *
   * @defaultValue 1
   */
  width?: number

  className?: string
}

/**
 * Create a plugin that, when added to a ProseMirror instance,
 * shows a line indicator for where the drop target will be.
 *
 * @builtin
 */
@extension<DropCursorOptions>({
  defaultOptions: {
    color: 'black',
    width: 1,
    className: '',
  },
  staticKeys: [],
  handlerKeys: [],
  customHandlerKeys: []
})
export class DropCursorExtension extends PlainExtension<DropCursorOptions> {
  get name() {
    return 'dropCursor' as const
  }

  /**
   * Use the dropCursor plugin with provided options.
   */
  public createExternalPlugins(): ProsemirrorPlugin[] {
    const { color, width, className } = this.options

    return [dropCursor({ color, width, class: className })]
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      dropCursor: DropCursorExtension
    }
  }
}
