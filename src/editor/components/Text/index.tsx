import { useRemirrorContext } from '@remirror/react'
import type { CSSProperties, FC } from 'react'
import React from 'react'

interface ITextProps {
  children?: React.ReactNode
  className?: string
  style?: CSSProperties
  codeEditor?: boolean
}

const Text: FC<ITextProps> = ({ children, ...props }) => {
  const { getRootProps } = useRemirrorContext()

  return (
    <div {...props} {...getRootProps()}>
      {children}
    </div>
  )
}

export default Text
