import { CodeBlockAttributes, CodeBlockExtension } from '@remirror/extension-code-block'
import { useActive, useCommands } from '@remirror/react-core'
import { FC, useCallback } from 'react'

import { t } from 'i18next'
import { CommandButton, CommandButtonProps } from './command-button'

export interface ToggleCodeBlockButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {
  attrs?: Partial<CodeBlockAttributes>
}

export const InsertSeparatorButton: FC<ToggleCodeBlockButtonProps> = ({ attrs = {}, ...rest }) => {
  const { insertHorizontalRule } = useCommands<CodeBlockExtension>()

  const handleSelect = useCallback(() => {
    if (insertHorizontalRule.enabled(attrs)) {
      insertHorizontalRule(attrs)
    }
  }, [insertHorizontalRule, attrs])

  const active = useActive<CodeBlockExtension>().codeMirror()
  const enabled = insertHorizontalRule.enabled(attrs)

  return (
    <CommandButton
      {...rest}
      label={t("toolbar.separator")}
      icon="ri-separator"
      commandName="insertHorizontalRule"
      active={active}
      enabled={enabled}
      attrs={attrs}
      onSelect={handleSelect}
    />
  )
}
