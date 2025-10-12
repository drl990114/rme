import type { NodeViewComponentProps } from '@rme-sdk/react'
import { t } from 'i18next'
import { useState, type FC } from 'react'
import styled from 'styled-components'
import { Button, Input } from 'zens'
import { Shortcut } from '../../toolbar/SlashMenu/SlashMenuRoot'
import { ImageNodeViewProps } from './image-nodeview'

interface ImageToolTipsProps {
  node: NodeViewComponentProps['node']
  updateAttributes?: NodeViewComponentProps['updateAttributes']
  imageHostingHandler?: ImageNodeViewProps['imageHostingHandler']
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spaceSm};
  padding: ${(props) => props.theme.spaceSm};
  min-width: 320px;
  background-color: ${(props) => props.theme.tipsBgColor};
  border: 1px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.smallBorderRadius};
  box-shadow: 0 4px 12px ${(props) => props.theme.boxShadowColor};
  z-index: 100;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spaceXs};
`

const FooterBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${(props) => props.theme.spaceXs};
`

const Label = styled.label`
  font-size: ${(props) => props.theme.fontXs};
  font-weight: 600;
  color: ${(props) => props.theme.labelFontColor};
  margin: 0;
`

const StyledInput = styled(Input)`
  width: 100%;
  font-size: ${(props) => props.theme.fontSm};

  & input {
    padding: ${(props) => props.theme.spaceXs} ${(props) => props.theme.spaceSm};
    border: 1px solid ${(props) => props.theme.borderColor};
    border-radius: ${(props) => props.theme.smallBorderRadius};
    background-color: ${(props) => props.theme.bgColor};
    color: ${(props) => props.theme.primaryFontColor};

    &:focus {
      border-color: ${(props) => props.theme.accentColor};
      outline: none;
      box-shadow: 0 0 0 2px ${(props) => props.theme.accentColor}33;
    }

    &::placeholder {
      color: ${(props) => props.theme.placeholderFontColor};
    }
  }
`

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${(props) => props.theme.spaceXs};
  margin-top: ${(props) => props.theme.spaceXs};
`

const ActionButton = styled(Button)`
  padding: ${(props) => props.theme.spaceXs} ${(props) => props.theme.spaceSm};
  font-size: ${(props) => props.theme.fontXs};
  border-radius: ${(props) => props.theme.smallBorderRadius};

  &.primary {
    background-color: ${(props) => props.theme.accentColor};
    border-color: ${(props) => props.theme.accentColor};
    color: white;

    &:hover {
      background-color: ${(props) => props.theme.accentColor}dd;
      border-color: ${(props) => props.theme.accentColor}dd;
    }
  }

  &.secondary {
    background-color: transparent;
    border-color: ${(props) => props.theme.borderColor};
    color: ${(props) => props.theme.primaryFontColor};

    &:hover {
      background-color: ${(props) => props.theme.hoverColor};
    }
  }
`

export const ImageToolTips: FC<ImageToolTipsProps> = (props) => {
  const { node, imageHostingHandler } = props
  const { src, alt } = node.attrs
  const [srcVal, setSrcVal] = useState(src || '')
  const [altVal, setAltVal] = useState(alt || '')
  const [hasChanges, setHasChanges] = useState(false)

  const handleSrcInput: React.FormEventHandler<HTMLInputElement> = (e) => {
    const newValue = e.currentTarget.value
    setSrcVal(newValue)
    setHasChanges(newValue !== src || altVal !== alt)
  }

  const handleAltInput: React.FormEventHandler<HTMLInputElement> = (e) => {
    const newValue = e.currentTarget.value
    setAltVal(newValue)
    setHasChanges(srcVal !== src || newValue !== alt)
  }

  const handleUpdate = () => {
    if (props.updateAttributes) {
      const currentSrc = node.attrs.src
      if (currentSrc && currentSrc !== srcVal && imageHostingHandler) {
        imageHostingHandler(currentSrc).then((newSrc) => {
          if (newSrc !== currentSrc) {
            props.updateAttributes?.({
              ...node.attrs,
              src: newSrc,
              alt: altVal.trim(),
            })
          }
        })
      } else {
        props.updateAttributes({
          ...node.attrs,
          src: srcVal.trim(),
          alt: altVal.trim(),
        })
      }
      setHasChanges(false)
    }
  }

  const handleReset = () => {
    setSrcVal(src || '')
    setAltVal(alt || '')
    setHasChanges(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleUpdate()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleReset()
    }
  }

  return (
    <Container>
      <InputGroup>
        <Label>URL</Label>
        <StyledInput
          placeholder="Enter image URL..."
          value={srcVal}
          onInput={handleSrcInput}
          onKeyDown={handleKeyPress}
        />
      </InputGroup>

      <InputGroup>
        <Label>Alt</Label>
        <StyledInput
          placeholder="Enter alternative text for accessibility..."
          value={altVal}
          onInput={handleAltInput}
          onKeyDown={handleKeyPress}
        />
      </InputGroup>
      <FooterBar>
        <Shortcut>
          <kbd aria-label="Esc">Esc</kbd>
          {t('slashMenu.toCancel')}
        </Shortcut>
        <Shortcut>
          <kbd aria-label="Enter">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 10 4 15 9 20"></polyline>
              <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
            </svg>
          </kbd>
          {t('slashMenu.toSelect')}
        </Shortcut>
      </FooterBar>
    </Container>
  )
}
