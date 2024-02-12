import { BaseStyle, darkTheme } from '@markflowy/theme'
import { Editor, EditorProvider, EditorRef } from '.'
import React, { FC, useLayoutEffect } from 'react'
import useDevTools from './playground/hooks/use-devtools'
import useContent from './playground/hooks/use-content'
import useChangeCodeMirrorTheme from './playground/hooks/useChangeCodeMirrorTheme'
import { DebugConsole } from './playground/components/DebugConsole'
import { DebugButton } from './playground/components/DebugButton'
import './App.css'

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

  useLayoutEffect(() => {
    loadThemeCss(darkTheme.globalStyleText!)
  }, [])

  const editor = (
    <div className="playground-self-scroll">
      <Editor
        key={contentId}
        ref={editorRef}
        content={content}
        offset={{ top: 10, left: 16 }}
        hooks={[useChangeCodeMirrorTheme]}
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
      <div className="markdown-body" style={{ width: "100%" }}>
        <EditorProvider theme={darkTheme.styledContants}>
          <BaseStyle />
          <DebugButton
            enableDevTools={enableDevTools}
            toggleEnableDevTools={() => setEnableDevTools(!enableDevTools)}
          />
          <div className="playground-box">
            {editor}
            {debugConsole}
          </div>
          <BlurHelper />
        </EditorProvider>
      </div>
    </main>
  )
}

export default App
