import { useRemirrorContext } from '@remirror/react'
import type { CSSProperties, FC } from 'react'
import React from 'react'
import styled, { css } from 'styled-components'

const Container = styled.div<{ codeEditor?: boolean }>`

`

interface ITextProps {
  children?: React.ReactNode
  className?: string
  style?: CSSProperties
  codeEditor?: boolean
}

const Text: FC<ITextProps> = ({ children, ...props }) => {
  const { getRootProps } = useRemirrorContext()

  return (
    <Container {...props} {...getRootProps()}>
      {children}
    </Container>
  )
}

export default Text
