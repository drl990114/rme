import { ExtensionUnderlineMessages as Messages } from '@rme-sdk/messages';

export const toggleUnderlineOptions: Remirror.CommandDecoratorOptions = {
  icon: 'underline',
  label: ({ t }) => t(Messages.LABEL),
  description: ({ t }) => t(Messages.DESCRIPTION),
};
