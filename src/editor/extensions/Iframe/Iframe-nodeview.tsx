import type { NodeViewComponentProps } from '@remirror/react'
import { Popover } from 'zens'
import { Resizable } from '@/editor/components/Resizable'
import { useRef } from 'react'

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
