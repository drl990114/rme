import { useActive, useCommands } from '@remirror/react-core'
import { FC, useCallback } from 'react'

import { t } from 'i18next'
import { LineListExtension } from '../../../extensions'
import { CommandButton, CommandButtonProps } from './command-button'

export interface ToggleTaskListButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const ToggleTaskListButton: FC<ToggleTaskListButtonProps> = (props) => {
  const { toggleList } = useCommands<LineListExtension>()

  const handleSelect = useCallback(() => {
    if (toggleList) {
      toggleList({
        kind: 'task',
      })
    }
  }, [toggleList])

  const active = useActive<LineListExtension>().list()
  const enabled = true

  return (
    <CommandButton
      {...props}
      label={t('toolbar.taskList')}
      icon="ri-list-check-3"
      commandName="toggleList"
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  )
}
