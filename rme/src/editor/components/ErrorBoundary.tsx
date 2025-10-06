import type { ErrorInfo, PropsWithChildren } from 'react'
import React from 'react'
import styled from 'styled-components'

const Title = styled.h1`
  color: ${({ theme }) => theme.dangerColor};
`

export interface ErrorBoundaryProps {
  hasError?: boolean
  error?: unknown
  fallback?: React.ComponentType<{ error: Error }>
  onError?: (params: { error: Error }) => void
}

const DefaultFallback = (props: { error: Error }) => (
  <>
    <Title>Sorry, something went wrong!</Title>
    <p>{String(props.error)}</p>
  </>
)

class ErrorBoundary extends React.Component<
  PropsWithChildren<ErrorBoundaryProps>,
  { hasError: boolean }
> {
  constructor(props: PropsWithChildren<ErrorBoundaryProps>) {
    super(props)
    this.state = { hasError: this.props.hasError ?? false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    const Fallback = this.props.fallback ?? DefaultFallback

    if (this.state.hasError) {
      const error = this.props.error as Error
      this.props.onError?.({
        error
      })

      return <Fallback error={error} />
    }

    return this.props.children
  }
}

export default ErrorBoundary
