import { useActive, useCommands } from '@rme-sdk/react-core'
import { FC, useCallback } from 'react'

import { CodeMirrorExtensionAttributes } from '@/editor/extensions/CodeMirror/codemirror-types'
import { t } from 'i18next'
import { CommandButton, CommandButtonProps } from './command-button'

export interface ToggleCodeBlockButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {
  attrs?: Partial<CodeMirrorExtensionAttributes>
}

export const InsertSeparatorButton: FC<ToggleCodeBlockButtonProps> = ({ attrs = {}, ...rest }) => {
  const { insertHorizontalRule } = useCommands()

  const handleSelect = useCallback(() => {
    if (insertHorizontalRule.enabled(attrs)) {
      insertHorizontalRule(attrs)
    }
  }, [insertHorizontalRule, attrs])

  const active = useActive().codeMirror()
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
