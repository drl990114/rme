import {
    ClickAwayListener,
    Grow,
    ListItemText,
    MenuItem,
    MenuList,
    Paper,
    Popper,
} from '@mui/material'
import { useCommands, type UseMultiPositionerReturn } from '@rme-sdk/react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Container = styled.div`
  position: absolute;

  .MuiList-padding {
    padding: 0;
  }
`

const ActiveCellMenu = (props: ActiveCellMenuProps) => {
  const { positioner } = props
  const commands = useCommands()
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  const options = [
    {
      label: 'insert column before',
      i18nKey: 'table.insertColumnBefore',
      handler: commands.addTableColumnBefore,
    },
    {
      label: 'insert column after',
      i18nKey: 'table.insertColumnAfter',
      handler: commands.addTableColumnAfter,
    },
    {
      label: 'insert row before',
      i18nKey: 'table.insertRowBefore',
      handler: commands.addTableRowBefore,
    },
    {
      label: 'insert row after',
      i18nKey: 'table.insertRowAfter',
      handler: commands.addTableRowAfter,
    },
    {
      label: 'delete column',
      i18nKey: 'table.deleteColumn',
      handler: commands.deleteTableColumn,
    },
    {
      label: 'delete row',
      i18nKey: 'table.deleteRow',
      handler: commands.deleteTableRow,
    },
  ]

  const handleClose = (event: Event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const { ref, key, x, y } = positioner

  return (
    <Container
      key={key}
      ref={ref}
      style={{
        left: x,
        top: y,
        width: 20,
        height: 20,
        zIndex: 1,
      }}
      onMouseDown={(e) => {
        e.preventDefault()
        setOpen(true)
      }}
    >
      <div ref={anchorRef}>
        <i className="ri-equalizer-line"></i>
      </div>
      <Popper
        sx={{
          zIndex: 1,
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList dense autoFocusItem>
                  {options.map((option) => (
                    <MenuItem
                      key={option.label}
                      onClick={() => {
                        option.handler()
                        setOpen(false)
                      }}
                    >
                      <ListItemText>{t(option.i18nKey)}</ListItemText>
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Container>
  )
}

export default ActiveCellMenu

interface ActiveCellMenuProps {
  positioner: UseMultiPositionerReturn
}
