import { ExtensionHorizontalRuleMessages as Messages } from '@rme-sdk/messages';

export const insertHorizontalRuleOptions: Remirror.CommandDecoratorOptions = {
  icon: 'separator',
  label: ({ t }) => t(Messages.LABEL),
  description: ({ t }) => t(Messages.DESCRIPTION),
};
