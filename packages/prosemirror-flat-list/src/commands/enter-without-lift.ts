import {
  createParagraphNear,
  newlineInCode,
  pmChainCommands,
  splitBlock,
} from '@remirror/pm/commands'
import type { Command } from '@remirror/pm/state'

/**
 * This command has the same behavior as the `Enter` keybinding from
 * `@remirror/pm/commands`, but without the `liftEmptyBlock` command.
 *
 * @internal
 */
export const enterWithoutLift: Command = pmChainCommands(
  newlineInCode,
  createParagraphNear,
  splitBlock,
)
