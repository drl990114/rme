import type { ErrorInfo, PropsWithChildren } from 'react'
import React from 'react'
import styled from 'styled-components'

const Title = styled.h1`
    color: ${({ theme }) => theme.dangerColor};
`

interface ErrorBoundaryProps {
  hasError?: boolean
  error?: unknown
}

class ErrorBoundary extends React.Component<
  PropsWithChildren<ErrorBoundaryProps>,
  { hasError: boolean }
> {
  constructor(props: PropsWithChildren<ErrorBoundaryProps>) {
    super(props)
    this.state = { hasError: this.props.hasError ?? false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      console.error(this.props.error)
      return (
        <>
          <Title data-testid='editor_error'>Sorry, something went wrong!</Title>
          <p>{String(this.props.error)}</p>
        </>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
