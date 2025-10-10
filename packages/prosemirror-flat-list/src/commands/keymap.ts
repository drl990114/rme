import {
  deleteSelection,
  joinTextblockBackward,
  joinTextblockForward,
  pmChainCommands,
  selectNodeBackward,
  selectNodeForward,
} from '@remirror/pm/commands'

import { Command } from '@remirror/pm/state'
import { createDedentListCommand } from './dedent-list'
import { createIndentListCommand } from './indent-list'
import { joinCollapsedListBackward } from './join-collapsed-backward'
import { joinListUp } from './join-list-up'
import { protectCollapsed } from './protect-collapsed'
import { createSplitListCommand } from './split-list'

/**
 * @internal
 */
export const enterCommand: Command = pmChainCommands(
  protectCollapsed,
  createSplitListCommand(),
)

/**
 * @internal
 */
export const backspaceCommand: Command = pmChainCommands(
  protectCollapsed,
  deleteSelection,
  joinListUp,
  joinCollapsedListBackward,
  joinTextblockBackward,
  selectNodeBackward,
)

/**
 * @internal
 */
export const deleteCommand: Command = pmChainCommands(
  protectCollapsed,
  deleteSelection,
  joinTextblockForward,
  selectNodeForward,
)

/**
 * Returns an object containing the keymap for the list commands.
 *
 * - `Enter`: See {@link enterCommand}.
 * - `Backspace`: See {@link backspaceCommand}.
 * - `Delete`: See {@link deleteCommand}.
 * - `Mod-[`: Decrease indentation. See {@link createDedentListCommand}.
 * - `Mod-]`: Increase indentation. See {@link createIndentListCommand}.
 *
 * @public  Commands
 */
export const listKeymap = {
  Enter: enterCommand,

  Backspace: backspaceCommand,

  Delete: deleteCommand,

  'Mod-[': createDedentListCommand(),

  'Mod-]': createIndentListCommand(),
}
