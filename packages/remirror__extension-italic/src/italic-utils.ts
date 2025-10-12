import { ExtensionItalicMessages as Messages } from '@rme-sdk/messages';

export const toggleItalicOptions: Remirror.CommandDecoratorOptions = {
  icon: 'italic',
  label: ({ t }) => t(Messages.LABEL),
  description: ({ t }) => t(Messages.DESCRIPTION),
};
