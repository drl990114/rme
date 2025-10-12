import {
    createParagraphNear,
    newlineInCode,
    pmChainCommands,
    splitBlock,
} from '@rme-sdk/pm/commands'
import type { Command } from '@rme-sdk/pm/state'

/**
 * This command has the same behavior as the `Enter` keybinding from
 * `@rme-sdk/pm/commands`, but without the `liftEmptyBlock` command.
 *
 * @internal
 */
export const enterWithoutLift: Command = pmChainCommands(
  newlineInCode,
  createParagraphNear,
  splitBlock,
)
