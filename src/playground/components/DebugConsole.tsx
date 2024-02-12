import { FC } from "react"
import { contentMap } from "../content"

export const DebugConsole: FC<{
  hasUnsavedChanges: boolean
  contentId: string
  content: string
  setContentId: (contentId: string) => void
}> = ({ hasUnsavedChanges, contentId, content, setContentId }) => {
  const options = Object.keys(contentMap).map((k) => (
    <option key={k} value={k}>
      {k}
    </option>
  ))
  return (
    <div
      style={{
        paddingTop: '32px',
        paddingBottom: '64px',
        paddingLeft: 'max(32px, calc(50% - 400px))',
        paddingRight: 'max(32px, calc(50% - 400px))',
        fontSize: '16px',
        lineHeight: '1.5',
      }}
      data-testid='playground_debug_console'
    >
      <p>
        <strong>hasUnsavedChanges: </strong>
        {JSON.stringify(hasUnsavedChanges)}
      </p>
      <p>
        <strong>content:</strong>
      </p>
      <select id='contentType' value={contentId} onChange={(e) => setContentId(e.target.value)}>
        {options}
      </select>
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          marginBottom: '16px',
          fontSize: '85%',
          borderRadius: '3px',
          padding: '16px',
          overflowWrap: 'break-word',
          overflow: 'hidden',
        }}
      >
        {content}
      </pre>
    </div>
  )
}
