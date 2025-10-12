import type { AnyExtension, AnyRemirrorManager } from '@rme-sdk/core';
import { ReactExtension } from '@rme-sdk/preset-react';
import React from 'react';
import { render, act as renderAct } from 'testing/react';

import { useManager } from '../';

// TODO: `jest.mock` doesn't work on ESM environments.
describe.skip('useManager', () => {
  // jest.mock('@rme-sdk/preset-react', () => {
  //   const actual = jest.requireActual('@rme-sdk/preset-react');
  //   return {
  //     ...actual,
  //     ReactExtension: jest
  //       .fn()
  //       .mockImplementation((...args: any[]) => new actual.ReactExtension(...args)),
  //   };
  // });

  it('does not recreate the react preset for every rerender', () => {
    const Component = (_: { options?: object }) => {
      useManager(() => [], {});

      return null;
    };

    const { rerender } = render(<Component />);
    rerender(<Component options={{}} />);
    rerender(<Component options={{}} />);

    expect(ReactExtension).toHaveBeenCalledTimes(1);
  });

  it('rerenders when the manager is destroyed', () => {
    let manager: AnyRemirrorManager;
    const Component = (_: { options?: object }) => {
      manager = useManager<AnyExtension>(() => [], {});

      return null;
    };

    const { rerender } = render(<Component />);

    rerender(<Component options={{}} />);
    rerender(<Component options={{}} />);

    renderAct(() => manager.destroy());
    expect(ReactExtension).toHaveBeenCalledTimes(2);

    rerender(<Component options={{}} />);
    expect(ReactExtension).toHaveBeenCalledTimes(2);
  });
});
