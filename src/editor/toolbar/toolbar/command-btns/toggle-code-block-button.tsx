import { CodeBlockAttributes, CodeBlockExtension } from '@remirror/extension-code-block'
import { useActive, useCommands } from '@remirror/react-core'
import { FC, useCallback } from 'react'

import { t } from 'i18next'
import { CommandButton, CommandButtonProps } from './command-button'

export interface ToggleCodeBlockButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {
  attrs?: Partial<CodeBlockAttributes>
}

export const ToggleCodeBlockButton: FC<ToggleCodeBlockButtonProps> = ({ attrs = {}, ...rest }) => {
  const { createCodeMirror } = useCommands<CodeBlockExtension>()

  const handleSelect = useCallback(() => {
    if (createCodeMirror.enabled(attrs)) {
      createCodeMirror(attrs)
    }
  }, [createCodeMirror, attrs])

  const active = useActive<CodeBlockExtension>().codeMirror()
  const enabled = createCodeMirror.enabled(attrs)

  return (
    <CommandButton
      {...rest}
      label={t('toolbar.codeBlock')}
      icon="ri-code-box-line"
      commandName="createCodeMirror"
      active={active}
      enabled={enabled}
      attrs={attrs}
      onSelect={handleSelect}
    />
  )
}
