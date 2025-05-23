import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AnyExtension, CommandsFromExtensions } from 'remirror'
import styled, { css } from 'styled-components'
import { darken } from '../../theme/darken-colors'
import TablePanel from './TablePanel'

type SlashMenuRootProps = {
  rootRef: React.RefObject<HTMLDivElement>
  commands: CommandsFromExtensions<AnyExtension>
  closeMenu: () => void
}

export enum ChildrenHandlerNext {
  None,
  ReturnLeftGroup,
  Close,
}

export const SlashMenuRoot: React.FC<SlashMenuRootProps> = memo(
  ({ rootRef, commands, closeMenu }) => {
    const componentRefMap = useRef<Record<string, any>>({})

    const menuItems = useMemo(() => {
      const headingItems = Array.from({ length: 6 }).map((_, i) => {
        return {
          title: `Heading ${i + 1}`,
          id: `Heading${i + 1}`,
          handler: () => {
            commands.toggleHeading({ level: i + 1 })
          },
        }
      })

      const res: {
        title: string
        id: string
        handler?: () => void
        Renderer?: {
          id: string
          Component: React.ReactNode
        }
        children?: {
          title: string
          id: string
          handler?: () => void
        }[]
      }[] = [
        {
          title: 'Text',
          id: 'text',
          children: headingItems,
        },
        {
          title: 'Table',
          id: 'table',
          handler: () => {
            componentRefMap.current.table?.createTable()
          },
          Renderer: {
            id: 'table',
            Component: (
              <TablePanel
                ref={(el) => (componentRefMap.current.table = el)}
                commands={commands}
                closeMenu={closeMenu}
              />
            ),
          },
        },
      ]

      if (commands.createAiBlock) {
        res.unshift({
          title: 'ai',
          id: 'ai',
          handler: () => {
            commands.createAiBlock({})
          },
        })
      }
      return res
    }, [closeMenu, commands])

    const [activeGroupId, setActiveGroupId] = useState(menuItems[0].id)
    const [activeItemId, setActiveItemId] = useState<string | undefined>()
    const currentIndex = menuItems.findIndex((item) => item.id === activeGroupId)
    const currentMenuItem = menuItems[currentIndex]

    const handleDown = useCallback(() => {
      if (activeItemId) {
        if (currentMenuItem?.children) {
          const currentChildIndex = currentMenuItem.children.findIndex(
            (item) => item.id === activeItemId,
          )
          const nextIndex = currentChildIndex + 1
          if (nextIndex < currentMenuItem.children.length) {
            setActiveItemId(currentMenuItem.children[nextIndex].id)
          }
        } else if (currentMenuItem.Renderer) {
          setActiveItemId(currentMenuItem.Renderer.id)
        }
      } else {
        const nextIndex = currentIndex + 1
        if (nextIndex < menuItems.length) {
          setActiveGroupId(menuItems[nextIndex].id)
        }
      }
    }, [activeItemId, currentIndex, currentMenuItem.Renderer, currentMenuItem.children, menuItems])

    const handleUp = useCallback(() => {
      if (activeItemId) {
        if (currentMenuItem?.children) {
          const currentChildIndex = currentMenuItem.children.findIndex(
            (item) => item.id === activeItemId,
          )
          const nextIndex = currentChildIndex - 1
          if (nextIndex >= 0) {
            setActiveItemId(currentMenuItem.children[nextIndex].id)
          }
        } else if (currentMenuItem.Renderer) {
          setActiveItemId(currentMenuItem.Renderer.id)
        }
      } else {
        const nextIndex = currentIndex - 1
        if (nextIndex >= 0) {
          setActiveGroupId(menuItems[nextIndex].id)
        }
      }
    }, [activeItemId, currentIndex, currentMenuItem.Renderer, currentMenuItem.children, menuItems])

    const handleRight = useCallback(() => {
      if (currentMenuItem?.children) {
        setActiveItemId(currentMenuItem.children[0].id)
      } else if (currentMenuItem?.Renderer) {
        setActiveItemId(currentMenuItem.Renderer.id)
      }
    }, [currentMenuItem])

    const handleLeft = useCallback(() => {
      setActiveItemId(undefined)
    }, [])

    useEffect(() => {
      const keydownHandler = (event: KeyboardEvent) => {
        if (activeItemId) {
          const componentRef = componentRefMap.current[activeItemId]
          if (componentRef?.handleKeyDown) {
            const next = componentRef.handleKeyDown(event)

            if (next === ChildrenHandlerNext.Close) {
              closeMenu()
              return
            } else if (next === ChildrenHandlerNext.None) {
              return
            }
          }
        }

        if (event.key === 'ArrowDown') {
          handleDown()
        } else if (event.key === 'ArrowUp') {
          handleUp()
        } else if (event.key === 'ArrowRight') {
          handleRight()
        } else if (event.key === 'ArrowLeft') {
          handleLeft()
        } else if (event.key === 'Enter') {
          // Prevent paragraph insertion
          event.preventDefault()
          event.stopPropagation()

          if (activeItemId) {
            const item = currentMenuItem?.children?.find((child) => child.id === activeItemId)
            if (item?.handler) {
              item.handler()
            }
          }
          if (currentMenuItem?.handler) {
            currentMenuItem.handler()
          }
          closeMenu()
        }
      }

      document.addEventListener('keydown', keydownHandler)

      return () => {
        document.removeEventListener('keydown', keydownHandler)
      }
    }, [
      activeItemId,
      handleDown,
      handleLeft,
      handleRight,
      handleUp,
      closeMenu,
      menuItems,
      currentMenuItem,
    ])

    return (
      <div ref={rootRef} style={{ display: 'flex' }}>
        <MenuPanel active location="left">
          {menuItems.map((item) => {
            const selected = item.id === activeGroupId
            return (
              <MenuItem onClick={() => setActiveGroupId(item.id)} key={item.id} selected={selected}>
                {item.title}
              </MenuItem>
            )
          })}
        </MenuPanel>
        {currentMenuItem?.children || currentMenuItem?.Renderer?.Component ? (
          <MenuPanel active={!!activeItemId} location="right">
            {currentMenuItem?.Renderer
              ? currentMenuItem.Renderer.Component
              : currentMenuItem?.children?.map((item) => {
                  const selected = item.id === activeItemId

                  return (
                    <MenuItem
                      key={item.id}
                      selected={selected}
                      onClick={() => {
                        setActiveItemId(item.id)
                        item.handler?.()
                        closeMenu()
                      }}
                    >
                      {item.title}
                    </MenuItem>
                  )
                })}
          </MenuPanel>
        ) : null}
      </div>
    )
  },
)

type MenuPanelProps = {
  location: 'left' | 'right'
  active: boolean
}

const MenuPanel = styled.div.attrs<MenuPanelProps>((p) => p)`
  display: flex;
  min-width: 130px;
  flex-direction: column;
  overscroll-behavior: contain;
  border-radius: ${(props) =>
    props.location === 'left'
      ? `${props.theme.smallBorderRadius} 0 0
    ${props.theme.smallBorderRadius}`
      : `0 ${props.theme.smallBorderRadius} ${props.theme.smallBorderRadius} 0`};
  background-color: ${(props) =>
    props.active ? darken(props.theme.contextMenuBgColorHover, 0.2) : props.theme.contextMenuBgColorHover};
  padding: ${(props) => props.theme.spaceXs};
  color: ${(props) => props.theme.primaryFontColor};
  font-size: ${(props) => props.theme.fontXs};
  outline: none;
  overflow: visible;
`

const MenuItem = styled.li.attrs<{
  selected: boolean
}>((props) => ({
  ...props,
}))`
  display: flex;
  cursor: default;
  align-items: center;
  border-radius: ${(props) => props.theme.smallBorderRadius};
  padding: ${(props) => props.theme.spaceXs};
  outline: none !important;

  &:hover {
    background-color: ${(props) => props.theme.contextMenuBgColorHover};
  }

  ${(p) => {
    if (p.selected) {
      return css`
        background-color: ${(props) => props.theme.contextMenuBgColorHover};
      `
    }
  }}
`
