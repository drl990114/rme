import { useRemirrorContext } from '@remirror/react'
import type { CSSProperties, FC } from 'react'
import React, { memo } from 'react'

interface ITextProps {
  children?: React.ReactNode
  className?: string
  style?: CSSProperties
  codeEditor?: boolean
}

const Text: FC<ITextProps> = memo(({ children, ...props }) => {
  const { getRootProps } = useRemirrorContext()

  const { key, ...rootProps} = getRootProps()

  return (
    <div {...props} {...rootProps} spellCheck={false} >
      {children}
    </div>
  )
})

export default Text
