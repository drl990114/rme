import { Resizable } from '@/editor/components/Resizable'
import type { NodeViewComponentProps } from '@remirror/react'
import { useRef } from 'react'
import { Popover } from 'zens'

export function IframeNodeView(props: NodeViewComponentProps) {
  const { node, selected } = props
  const initRef = useRef<() => void>()

  return (
    <Popover placement='top-start' open={selected} arrow={false}>
      <Resizable controlInit={(init) => (initRef.current = init)} {...props}>
        <iframe onLoad={() => initRef.current?.()} {...node.attrs}/>
      </Resizable>
    </Popover>
  )
}
