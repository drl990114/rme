import { WysiwygThemeWrapper } from '../../theme'
import { prosemirrorNodeToHtml } from 'remirror'
import type { Node } from '@remirror/pm/model'
import { EditorProps } from '../Editor'
import { createWysiwygDelegate } from '../WysiwygEditor'

interface PreviewProps {
  doc: Node | string
  delegateOptions?: EditorProps['delegateOptions']
}

export const Preview: React.FC<PreviewProps> = (props) => {
  const { doc, delegateOptions } = props
  let targetDoc: PreviewProps['doc'] = doc

  if (typeof targetDoc === 'string') {
    targetDoc = createWysiwygDelegate(delegateOptions).stringToDoc(targetDoc)
  }

  const html = prosemirrorNodeToHtml(targetDoc)

  return <WysiwygThemeWrapper dangerouslySetInnerHTML={{ __html: html }} />
}
