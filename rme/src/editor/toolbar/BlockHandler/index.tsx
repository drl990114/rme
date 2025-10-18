import { isHTMLElement } from '@ocavue/utils'
import { NodeSelection } from '@rme-sdk/pm/state'
import { useExtension, useRemirrorContext } from '@rme-sdk/react-core'
import { memo } from 'react'
import styled from 'styled-components'
import { createDraggingPreview, setViewDragging } from '../../extensions/NodeIndicator/drag-preview'
import {
  NodeIndicatorExtension,
  NodeIndicatorState,
} from '../../extensions/NodeIndicator/node-indicator-extension'

const nodeTypeIconMap: Record<string, string> = {
  'heading-1': 'ri-h-1',
  'heading-2': 'ri-h-2',
  'heading-3': 'ri-h-3',
  'heading-4': 'ri-h-4',
  'heading-5': 'ri-h-5',
  'heading-6': 'ri-h-6',
  paragraph: 'ri-paragraph',
  'list-bullet': 'ri-list-unordered',
  'list-ordered': 'ri-list-ordered',
  'list-task': 'ri-list-check-3',
  codeMirror: 'ri-code-box-line',
  table: 'ri-table-line',
  html_block: 'ri-html5-line',
  math_block: 'ri-formula',
}

export const BlockHandler = memo(() => {
  const { view: editorView } = useRemirrorContext({ autoUpdate: true })
  const nodeIndicatorExtension = useExtension(NodeIndicatorExtension)
  const state = nodeIndicatorExtension.getPluginState() as NodeIndicatorState | undefined

  const handleClick = () => {
    if (editorView && nodeIndicatorExtension) {
      const state = nodeIndicatorExtension.getPluginState() as NodeIndicatorState | undefined
      if (state && state.pos !== null && state.node) {
        const tr = editorView.state.tr
        tr.setSelection(NodeSelection.create(tr.doc, state.pos))
        editorView.dispatch(tr)
      }
    }
  }

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    if (editorView && nodeIndicatorExtension) {
      const state = nodeIndicatorExtension.getPluginState() as NodeIndicatorState | undefined
      if (state && state.pos !== null && state.node && state.node.isBlock) {
        let tr = editorView.state.tr
        tr = tr.setSelection(NodeSelection.create(tr.doc, state.pos))

        editorView.dispatch(tr)
        editorView.dom.classList.add('rme-dragging')

        const dom = editorView.nodeDOM(state.pos)

        if (dom && isHTMLElement(dom)) {
          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move'
          }

          createDraggingPreview(editorView, state, event)
          setViewDragging(editorView, state)
        }
      }
    }
  }

  const handleDragEnd = () => {
    editorView.dom.classList.remove('rme-dragging')
  }

  if (!editorView || !state?.node) {
    return null
  }

  const renderIcon = () => {
    let key = state?.node?.type?.name || ''
    if (state?.node?.type?.name === 'heading') {
      key = `heading-${state?.node?.attrs?.level}`
    }

    if (state?.node?.type?.name === 'list') {
      key = `list-${state?.node?.attrs?.kind}`
    }

    const iconName = nodeTypeIconMap[key || '']
    if (iconName) {
      return <i className={iconName} />
    }

    return null
  }

  return (
    <Container
      key="rme-block-handler"
      className="rme-block-handler"
      draggable="true"
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        position: 'fixed',
        left: `${state?.rect?.left ? state.rect.left - 38 : 0}px`,
        top: `${state?.rect?.top || 0}px`,
      }}
    >
      {renderIcon()}

      <div className="rme-draggable-handler">
        <i className="ri-draggable" />
      </div>
    </Container>
  )
})

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2px;
  border: 1px solid ${(props) => props.theme.borderColor};
  border-radius: 4px;
  font-size: 14px;
  z-index: 10;

  .rme-draggable-handler {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 18px;
    width: 18px;
    border-radius: 4px;
    cursor: grab;

    &:hover {
      background-color: ${(props) => props.theme.hoverColor};
    }
  }
`
