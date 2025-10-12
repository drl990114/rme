import { RemirrorJSON } from '@rme-sdk/core';
import React, { FC } from 'react';

import { MarkMap } from '../types';
import { TextHandler } from './text';

export const CodeBlock: FC<{
  node: RemirrorJSON;
  markMap: MarkMap;
}> = (props) => {
  const content = props.node.content;

  if (!content) {
    return null;
  }

  const children = content.map((node, ii) => <TextHandler key={ii} {...{ ...props, node }} />);

  return (
    <pre>
      <code>{children}</code>
    </pre>
  );
};
