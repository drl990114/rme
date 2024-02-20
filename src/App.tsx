import { Editor, ThemeProvider, EditorRef } from '.'
import React, { FC, useLayoutEffect } from 'react'
import useDevTools from './playground/hooks/use-devtools'
import useContent from './playground/hooks/use-content'
import { DebugConsole } from './playground/components/DebugConsole'
import { FormControlLabel, FormGroup, Switch } from '@mui/material'
import { DebugButton } from './playground/components/DebugButton'
import './App.css'
import 'remixicon/fonts/remixicon.css'

let themeEl: undefined | HTMLStyleElement
const THEME_ID = 'mf-markdown-theme'

export function loadThemeCss(url: string) {
  if (themeEl) themeEl.remove()

  themeEl = document.createElement('style')
  themeEl.setAttribute('id', THEME_ID)
  themeEl.innerHTML = url
  document.head.appendChild(themeEl)
}

function App() {
  const editorRef = React.useRef<EditorRef>(null)
  const { contentId, content, hasUnsavedChanges, setContentId, setContent } = useContent()
  const { enableDevTools, setEnableDevTools } = useDevTools()
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark')

  const editor = (
    <div className="playground-self-scroll">
      <Editor
        key={contentId}
        ref={editorRef}
        content={content}
        offset={{ top: 10, left: 16 }}
        onChange={(_, content) => setContent(content)}
        isTesting
      />
    </div>
  )

  const debugConsole = enableDevTools ? (
    <div className="playground-self-scroll">
      <DebugConsole
        hasUnsavedChanges={hasUnsavedChanges}
        contentId={contentId}
        content={content}
        setContentId={setContentId}
      />
    </div>
  ) : null

  const BlurHelper: FC = () => {
    return (
      <button
        className="blur-helper"
        style={{
          position: 'absolute',
          bottom: '64px',
          right: '64px',
          opacity: 0,
        }}
      ></button>
    )
  }

  return (
    <main>
      <div>
        <h1>
          Markflowy - <small>WYSIWYG Markdown Editor</small>
        </h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <select
          onChange={(e) => {
            const value = e.target.value
            if (value === 'wysiwyg') {
              editorRef.current?.toggleType('wysiwyg')
            } else {
              editorRef.current?.toggleType('sourceCode')
            }
          }}
        >
          <option value="wysiwyg">wysiwyg</option>
          <option value="sourceCode">source code</option>
        </select>
        <FormGroup>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label={theme}
            labelPlacement="start"
            onChange={(e) => {
              if (e.target.checked) {
                setTheme('dark')
              } else {
                setTheme('light')
              }
            }}
          />
        </FormGroup>
      </div>
      <ThemeProvider
        theme={{
          mode: theme,
        }}
      >
        <DebugButton
          enableDevTools={enableDevTools}
          toggleEnableDevTools={() => setEnableDevTools(!enableDevTools)}
        />
        <div className="playground-box">
          {editor}
          {debugConsole}
        </div>
        <BlurHelper />
      </ThemeProvider>
    </main>
  )
}

export default App
