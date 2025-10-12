import { RemirrorJSON } from '@rme-sdk/core';
import React from 'react';
import { strictRender } from 'testing/react';

import { CodeBlock } from '../';

describe('CodeBlock', () => {
  it('renders codeblock to HTML', () => {
    const json: RemirrorJSON = {
      type: 'codeBlock',
      attrs: {
        language: 'js',
      },
      content: [
        {
          type: 'text',
          text: 'Code',
        },
      ],
    };
    const { container } = strictRender(<CodeBlock node={json} markMap={{}} />);

    expect(container.innerHTML).toMatchInlineSnapshot(`
      <pre>
        <code>
          Code
        </code>
      </pre>
    `);
  });
});
