import {
  Editor,
  ThemeProvider,
  EditorRef,
  createWysiwygDelegate,
  WysiwygThemeWrapper,
  Preview,
  createSourceCodeDelegate,
  extractMatches,
} from '.'
import React, { FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import useDevTools from './playground/hooks/use-devtools'
import useContent from './playground/hooks/use-content'
import { DebugConsole } from './playground/components/DebugConsole'
import { FormControlLabel, FormGroup, Switch } from '@mui/material'
import { DebugButton } from './playground/components/DebugButton'
import { ThemeProvider as ZThemeProvider } from 'zens'
import { Node } from '@remirror/pm/model'
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

const debounce = (fn: (...args: any) => void, delay: number) => {
  let timer: number
  return (...args: any) => {
    clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delay)
  }
}

function App() {
  const editorRef = React.useRef<EditorRef>(null)
  const { contentId, content, hasUnsavedChanges, setContentId, setContent } = useContent()
  const { enableDevTools, setEnableDevTools } = useDevTools()
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark')
  const [editorDelegate, setEditorDelegate] = useState(createWysiwygDelegate())

  const debounceChange = debounce((params) => {
    setContent(editorDelegate.docToString(params.state.doc) || '')
  }, 300)

  const editor = (
    <div className="playground-self-scroll">
      <Editor
        initialType="wysiwyg"
        key={contentId}
        delegate={editorDelegate}
        ref={editorRef}
        content={content}
        onChange={debounceChange}
        isTesting={false}
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

  const themeData = {
    mode: theme,
  }
  return (
    <main>
      <ZThemeProvider theme={themeData}>
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
                setEditorDelegate(createWysiwygDelegate())
                editorRef.current?.toggleType('wysiwyg')
              } else if (value === 'sourceCode') {
                setEditorDelegate(createSourceCodeDelegate({
                  onCodemirrorViewLoad: (cmNodeView) => {
                    extractMatches(cmNodeView.cm)
                    console.log('cmNodeView', cmNodeView)
                  }
                }))
                editorRef.current?.toggleType('sourceCode')
              } else {
                editorRef.current?.toggleType('preview')
              }
            }}
          >
            <option value="wysiwyg">wysiwyg</option>
            <option value="sourceCode">source code</option>
            <option value="preview">preview</option>
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
          theme={themeData}
          i18n={{
            locales: {
              'zh-CN': {
                translation: {
                  table: {
                    insertColumnAfter: '向后插入列',
                    insertColumnBefore: '向前插入列',
                    insertRowAfter: '向后插入行',
                    insertRowBefore: '向前插入行',
                    deleteColumn: '删除列',
                    deleteRow: '删除行',
                  },
                },
              },
            },
            language: 'zh-CN',
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
      </ZThemeProvider>
    </main>
  )
}

export default App
