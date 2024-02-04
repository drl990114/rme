import { lightTheme } from '@markflowy/theme'
import { WysiwygEditor, EditorProvider } from '.'

function App() {
  return (
    <main>
      <EditorProvider theme={lightTheme.styledContants}>
        <WysiwygEditor content="# h1" />
      </EditorProvider>
    </main>
  )
}

export default App
