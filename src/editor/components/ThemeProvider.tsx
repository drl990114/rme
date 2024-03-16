import { ThemeProvider as ScThemeProvider } from 'styled-components'
import { CreateThemeOptions, changeTheme } from '../codemirror'
import { useEffect } from 'react'
import { darkTheme, lightTheme } from '../theme'

export * from './Editor'

type Props = {
  theme?: {
    mode: 'light' | 'dark'
    /**
     * Some theme variables can be modified through the token attribute in theme.
     */
    token?: Record<string, any>
    /**
     * The sourcode editor theme.
     */
    codemirrorTheme?: CreateThemeOptions
  }
  children?: React.ReactNode
}

export const ThemeProvider: React.FC<Props> = ({ theme, children }: Props) => {
  const mode = theme?.mode || 'light'

  const defaultThemeToken = mode === 'dark' ? darkTheme.styledConstants: lightTheme.styledConstants

  const themeToken = theme?.token ? { ...defaultThemeToken, ...theme.token } : defaultThemeToken

  useEffect(() => {
    const codemirrorTheme =
      theme?.codemirrorTheme || mode === 'dark'
        ? darkTheme.codemirrorTheme
        : lightTheme.codemirrorTheme
    changeTheme(codemirrorTheme)
  }, [mode, theme?.codemirrorTheme, changeTheme])

  return <ScThemeProvider theme={themeToken}>{children}</ScThemeProvider>
}
