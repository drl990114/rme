import { WysiwygThemeWrapper } from '../../theme'
import { prosemirrorNodeToHtml } from 'remirror'
import type { Node } from '@remirror/pm/model'

interface PreviewProps {
  doc: Node
}

export const Preview: React.FC<PreviewProps> = (props) => {
  const { doc } = props

  const html = prosemirrorNodeToHtml(doc)

  return <WysiwygThemeWrapper dangerouslySetInnerHTML={{ __html: html }} />
}
