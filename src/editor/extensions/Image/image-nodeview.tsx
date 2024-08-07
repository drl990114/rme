import type { NodeViewComponentProps } from '@remirror/react'
import { Image as ZensImage, Popover } from 'zens'
import type { PopoverStore } from 'zens'
import { ImageToolTips } from './image-tool-tips'
import { Resizable } from '@/editor/components/Resizable'
import { useEffect, useRef, useState } from 'react'
import type { ExtensionsOptions } from '..'

export interface ImageNodeViewProps extends NodeViewComponentProps {
  handleViewImgSrcUrl?: ExtensionsOptions['handleViewImgSrcUrl']
}

const warningFallBack =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAAAAACIM/FCAAAChElEQVR4Ae3aMW/TQBxAcb70k91AAiGuGlZAtOlQApWaDiSdklZq2RPUTm1xUWL3PgqSpygkXlh88N54nn7S2Trd3y/CP5IQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECPmPIEKECBEiRIgQIeX82+FBO0naB4eTRRkt5P7sNWt1Rw9RQvKThI2SYR4f5OoVW2rfRAYpT6hqHc8WeVHki9mgRdWwiAmyfA9AdrlaW5tlAHxcxQMpK8feRbGxPEkrSREN5ARg/y780V0GMIwFcgXwLg9byvsAN3FA8lfAfr7jYQZ0nqKAfAb21vYVwNruSoEvMUDuE+Ai7IKECZA+RAA5A7JiN6TMgFHzIeUb4DLshoQZ0H1uPGQOvFzVQZYtYNF4yBg4DnWQMAAmjYccArN6yBQ4ajzkAFjUQ+ZAv/GQNpDXQ3Kg03hIAhT1kAJIhLi1/vJl39Ic6Mf3+a2K8PM7BgahtgEwjuKI0lqGjSI8opRdYFb3sk/jODSGEZCVuyFFDzgPzYc8JMBkN2QMpI8RQMIQ2LvdBblNgdM4Lh/aQJaHrf3sAe2nKCDhGqCfb3VEcx1UNQTItlzQ3fYAvoZYIMUHgHRSbiyPU4BPZUSX2JWEbLZcW5v2qByrmMYKxZCq1mA6z4sin08HLapOy8gGPddtttT5HuHobZiwUXr6K85h6KjLWm/PH+MdTy/GR/12knb6g8mPZ38YECJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAh0fUb5q7oCGreEVEAAAAASUVORK5CYII='

export function ImageNodeView(props: ImageNodeViewProps) {
  const { node, selected, updateAttributes, handleViewImgSrcUrl } = props
  const initRef = useRef<() => void>()
  const popoverStore = useRef<PopoverStore>()
  const [open, setOpen] = useState(selected)

  useEffect(() => {
    if (!selected) {
      popoverStore.current?.setOpen(false)
    }
    setOpen(selected)
  }, [selected])

  const handleStoreChange = (store: PopoverStore) => (popoverStore.current = store)

  const Main = (
    <Resizable controlInit={(init) => (initRef.current = init)} {...props}>
      <ZensImage
        onLoad={() => initRef.current?.()}
        src={node.attrs.src}
        imgPromise={(src) => {
          return new Promise((resolve, reject) => {
            const makeImageLoad = (targetSrc: string) => {
              const img = new Image()
              img.src = targetSrc
              img.onload = () => {
                resolve(targetSrc)
              }
              img.onerror = () => {
                reject(warningFallBack)
              }
            }
            if (handleViewImgSrcUrl) {
              handleViewImgSrcUrl(node.attrs.src).then((newSrc) => {
                makeImageLoad(newSrc)
              })
            } else {
              makeImageLoad(node.attrs.src)
            }
          })
        }}
        {...node.attrs}
      />
    </Resizable>
  )

  if (!open) {
    return Main
  }

  return (
    <Popover
      customContent={<ImageToolTips node={node} updateAttributes={updateAttributes} />}
      placement="top-start"
      onClose={() => {
        setOpen(false)
      }}
      open={open}
      onStoreChange={handleStoreChange}
      toggleOnClick
    >
      {Main}
    </Popover>
  )
}
