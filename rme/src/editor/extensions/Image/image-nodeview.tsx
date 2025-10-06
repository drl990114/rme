import { Resizable } from '../../components/Resizable'
import type { NodeViewComponentProps } from '@remirror/react'
import { useCallback, useEffect, useRef } from 'react'
import type { PopoverStore } from 'zens'
import { Popover, Image as ZensImage } from 'zens'
import type { ExtensionsOptions } from '..'
import { ImageToolTips } from './image-tool-tips'

export interface ImageNodeViewProps extends NodeViewComponentProps {
  resizeable?: boolean
  defaultSyntaxType?: 'html' | 'md'
  handleViewImgSrcUrl?: ExtensionsOptions['handleViewImgSrcUrl']
  imageHostingHandler?: (src: string) => Promise<string>
}

const warningFallBack =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAAAAACIM/FCAAAChElEQVR4Ae3aMW/TQBxAcb70k91AAiGuGlZAtOlQApWaDiSdklZq2RPUTm1xUWL3PgqSpygkXlh88N54nn7S2Trd3y/CP5IQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECPmPIEKECBEiRIgQIeX82+FBO0naB4eTRRkt5P7sNWt1Rw9RQvKThI2SYR4f5OoVW2rfRAYpT6hqHc8WeVHki9mgRdWwiAmyfA9AdrlaW5tlAHxcxQMpK8feRbGxPEkrSREN5ARg/y780V0GMIwFcgXwLg9byvsAN3FA8lfAfr7jYQZ0nqKAfAb21vYVwNruSoEvMUDuE+Ai7IKECZA+RAA5A7JiN6TMgFHzIeUb4DLshoQZ0H1uPGQOvFzVQZYtYNF4yBg4DnWQMAAmjYccArN6yBQ4ajzkAFjUQ+ZAv/GQNpDXQ3Kg03hIAhT1kAJIhLi1/vJl39Ic6Mf3+a2K8PM7BgahtgEwjuKI0lqGjSI8opRdYFb3sk/jODSGEZCVuyFFDzgPzYc8JMBkN2QMpI8RQMIQ2LvdBblNgdM4Lh/aQJaHrf3sAe2nKCDhGqCfb3VEcx1UNQTItlzQ3fYAvoZYIMUHgHRSbiyPU4BPZUSX2JWEbLZcW5v2qByrmMYKxZCq1mA6z4sin08HLapOy8gGPddtttT5HuHobZiwUXr6K85h6KjLWm/PH+MdTy/GR/12knb6g8mPZ38YECJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAh0fUb5q7oCGreEVEAAAAASUVORK5CYII='

export function ImageNodeView(props: ImageNodeViewProps) {
  const { node, selected, updateAttributes, handleViewImgSrcUrl, imageHostingHandler } = props
  const initRef = useRef<() => void>()
  const popoverStore = useRef<PopoverStore>()
  const popoverRef = useRef<HTMLDivElement>(null)

  // useEffect(() => {
  //   const toggle = () => {
  //     popoverStore.current?.toggle()
  //   }

  //   if (selected) {
  //     setTimeout(() => {
  //       popoverRef.current?.addEventListener('click', toggle)
  //     })
  //   }

  //   return () => {
  //     popoverRef.current?.removeEventListener('click', toggle)
  //   }
  // }, [selected])

  const handleStoreChange = (store: PopoverStore) => {
    popoverStore.current = store
  }

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        popoverStore.current &&
        (!event.target ||
          !(event.target instanceof Node) ||
          !popoverRef.current.contains(event.target))
      ) {
        popoverStore.current.setOpen(false)
      }
    }

    if (selected) {
      document.addEventListener('mousedown', handleOutsideClick)
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick)
      }
    }
  }, [selected])

  const handleResize = useCallback(() => {
    updateAttributes({
      ['data-rme-type']: 'html',
    })
  }, [updateAttributes])

  const Main = (
    <Resizable
      key={`${node.attrs.src}_${node.attrs['data-rme-loading']}`}
      controlInit={(init) => (initRef.current = init)}
      onResize={handleResize}
      {...props}
    >
      <ZensImage
        onLoad={() => initRef.current?.()}
        src={node.attrs.src}
        imgPromise={(src) => {
          return new Promise((resolve, reject) => {
            if (node.attrs['data-rme-loading'] === 'true') {
              return
            }

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

  return (
    <div ref={popoverRef} style={{ position: 'relative', zIndex: selected ? 10 : 'auto' }}>
      <Popover
        customContent={
          <ImageToolTips
            key={`${node.attrs.src}`}
            node={node}
            imageHostingHandler={imageHostingHandler}
            updateAttributes={(...args) => {
              updateAttributes(...args)
              popoverStore.current?.setOpen(false)
            }}
          />
        }
        placement="top-start"
        onStoreChange={handleStoreChange}
        toggleOnClick
        style={{ zIndex: 11 }}
      >
        {Main}
      </Popover>
    </div>
  )
}
