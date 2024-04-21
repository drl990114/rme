import { useState, type FC } from 'react'
import { Input, Space, Tooltip } from 'zens'
import type { NodeViewComponentProps } from '@remirror/react'

interface ImageToolTipsProps {
  node: NodeViewComponentProps['node']
  updateAttributes?: NodeViewComponentProps['updateAttributes']
}

export const ImageToolTips: FC<ImageToolTipsProps> = (props) => {
  const { node } = props
  const { src } = node.attrs
  const [srcVal, setSrcVal] = useState(src || undefined)

  const handleSrcInput: React.FormEventHandler<HTMLInputElement> = (e) => {
    setSrcVal(e.currentTarget.value)
  }

  const updateSrc = (e: KeyboardEvent) => {
    e.stopPropagation()
    if (props.updateAttributes) {
      props.updateAttributes({ ...node.attrs, src: srcVal })
    }
  }

  return (
    <Input
      placeholder="Image URL [Enter]"
      value={srcVal}
      style={{ fontSize: '14px' }}
      onInput={handleSrcInput}
      onPressEnter={updateSrc}
    />
  )
}
