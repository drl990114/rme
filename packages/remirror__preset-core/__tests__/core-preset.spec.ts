import { GapCursorExtension } from '@rme-sdk/extension-gap-cursor';
import { hideConsoleError } from 'testing';

import { createCoreManager } from '../';

hideConsoleError(true);

test('it can exclude extensions', () => {
  const manager = createCoreManager([], { core: { excludeExtensions: ['gapCursor'] } });
  expect(() => manager.getExtension(GapCursorExtension)).toThrow();
});
