import { markdown } from '@codemirror/lang-markdown'
import { CountExtension } from '@remirror/extension-count'
import { createReactManager } from '@remirror/react'
import type { RemirrorManager } from 'remirror'
import { DocExtension } from 'remirror/extensions'
import { MfCodemirrorView } from '../../codemirror/codemirror'
import { LineCodeMirrorExtension } from '../../extensions/CodeMirror/codemirror-extension'
import { basicSetup } from '../../extensions/CodeMirror/setup'
import type { DocToString, EditorDelegate, StringToDoc } from '../../types'

type CreateSourceCodeManagerOptions = {
  language?: string
  onCodemirrorViewLoad: (cm: MfCodemirrorView) => void
}
export function createSourceCodeManager(
  options?: CreateSourceCodeManagerOptions,
): RemirrorManager<any> {
  return createReactManager(() => [
    new CountExtension({}),
    new DocExtension({ content: 'codeMirror' }),
    new LineCodeMirrorExtension({
      hideDecoration: true,
      showCopyButton: false,
      extensions: [basicSetup, markdown()],
      onCodemirrorViewLoad: options?.onCodemirrorViewLoad,
    }),
  ])
}

export const createSourceCodeDelegate = (
  options?: CreateSourceCodeManagerOptions,
): EditorDelegate<any> => {
  const manager = createSourceCodeManager(options)

  const stringToDoc: StringToDoc = (content: string) => {
    const schema = manager.schema
    const attrs = { language: options?.language || 'markdown' }
    const child = content ? schema.text(content) : undefined
    return schema.nodes.doc.create({}, schema.nodes.codeMirror.create(attrs, child))
  }

  const docToString: DocToString = (doc) => {
    return doc.textContent
  }

  return { manager, stringToDoc, docToString, view: 'SourceCode' }
}
