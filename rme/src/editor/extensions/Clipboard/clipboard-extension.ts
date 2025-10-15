import type { CommandFunction, CreateExtensionPlugin, EditorView } from '@rme-sdk/core'
import { extension, PlainExtension } from '@rme-sdk/core'
import { DOMParser, Fragment, Node, Slice } from '@rme-sdk/pm/model'
import { getMdImageInputRule } from '../../inline-input-regex'
import { getTransformerByView } from '../Transformer/utils'

type UnknownRecord = Record<string, unknown>
function isPureText(content: UnknownRecord | UnknownRecord[] | undefined | null): boolean {
  if (!content) return false
  if (Array.isArray(content)) {
    if (content.length > 1) return false
    return isPureText(content[0])
  }

  const child = content.content
  if (child) return isPureText(child as UnknownRecord[])

  return content.type === 'text'
}

function isTextOnlySlice(slice: Slice): Node | false {
  if (slice.content.childCount === 1) {
    const node = slice.content.firstChild
    if (node?.type.name === 'text' && node.marks.length === 0) return node

    if (node?.type.name === 'paragraph' && node.childCount === 1) {
      const _node = node.firstChild
      if (_node?.type.name === 'text' && _node.marks.length === 0) return _node
    }
  }

  return false
}

type ClipboardExtensionOptions = {
  imageCopyHandler?: (src: string) => Promise<string>
}

@extension<ClipboardExtensionOptions>({
  defaultOptions: {},
  staticKeys: [],
  handlerKeys: [],
  customHandlerKeys: [],
})
export class ClipboardExtension extends PlainExtension<ClipboardExtensionOptions> {
  get name() {
    return 'clipboard' as const
  }

  createPlugin(): CreateExtensionPlugin {
    return {
      props: {
        handlePaste: (view, event) => {
          const transformer = getTransformerByView(view)

          const parser = transformer.stringToDoc
          const schema = view.state.schema
          const editable = view.props.editable?.(view.state)
          const { clipboardData } = event
          if (!editable || !clipboardData) return false

          const currentNode = view.state.selection.$from.node()
          if (currentNode.type.spec.code) return false

          const text = clipboardData.getData('text/plain')

          const html = clipboardData.getData('text/html')
          if (html.length === 0 && text.length === 0) return false

          const domParser = DOMParser.fromSchema(schema)
          let dom
          if (html.length === 0) {
            const slice = parser?.(text)

            if (!slice || typeof slice === 'string') return false

            const res: Node[] = []
            slice.content.forEach((node, index) => {
              if (node.type.name === 'paragraph' && index === 0) {
                node.content.forEach((child) => {
                  res.push(child)
                })
              } else {
                res.push(node)
              }
            })

            // Process images asynchronously
            this.processImagesInNodesAsync(res, view)

            // For multiple nodes, we need to replace with a fragment
            if (res.length === 1) {
              view.dispatch(view.state.tr.replaceSelectionWith(res[0], false))
            } else {
              const fragment = Fragment.from(res)
              view.dispatch(view.state.tr.replaceSelection(new Slice(fragment, 0, 0)))
            }

            return true
          } else {
            const template = document.createElement('template')
            template.innerHTML = html
            dom = template.content.cloneNode(true)
            template.remove()
          }

          const slice = domParser.parseSlice(dom)
          const node = isTextOnlySlice(slice)
          if (node) {
            // Even for text-only nodes, check if it's an image node
            if (
              (node.type.name === 'html_image' || node.type.name === 'md_image') &&
              node.attrs.src
            ) {
              this.processImageNode(node, view)
              view.dispatch(view.state.tr.replaceSelectionWith(node, true))
            } else {
              this.processMarkdownImageSyntax(node, view).then(() => {
                view.dispatch(view.state.tr.replaceSelectionWith(node, true))
              })
            }

            return true
          }

          this.processImagesInSliceAsync(slice, view)

          view.dispatch(view.state.tr.replaceSelection(slice))
          return true
        },
        clipboardTextSerializer: (slice, view) => {
          const schema = view.state.schema
          const transformer = getTransformerByView(view)
          const serializer = transformer.docToString
          const isText = isPureText(slice.content.toJSON())
          if (isText)
            return (slice.content as unknown as Node).textBetween(0, slice.content.size, '\n\n')

          const doc = schema.topNodeType.createAndFill(undefined, slice.content)
          if (!doc) return ''
          const value = serializer?.(doc) || ''
          return value
        },
      },
    }
  }

  createCommands() {
    return {
      copy: (): CommandFunction =>{
        return (props) => {
          if (props.tr.selection.empty) {
            return false
          }

          if (props.dispatch) {
            document.execCommand('copy')
          }

          return true
        }
      },
      paste: (): CommandFunction => {
        return (params) => {
          const { view } = params
          if (!view) return false
          console.log('handlePaste event', event)
          const transformer = getTransformerByView(view)

          const parser = transformer.stringToDoc
          const schema = view.state.schema
          const editable = view.props.editable?.(view.state)
          navigator.clipboard.read().then(async (data) => {
            let html = ''
            let text = ''
            const htmlData = data.find((item) => item.types.includes('text/html'))
            const textData = data.find((item) => item.types.includes('text/plain'))

            const getHtml = async () => {
              if (htmlData) {
                const blob = await htmlData.getType('text/html')
                html = await blob.text()
              }
            }
            const getText = async () => {
              if (textData) {
                const blob = await textData.getType('text/plain')
                text = await blob.text()
              }
            }

            await Promise.all([getHtml(), getText()])

            if (!editable || !html || !text) return false

            const currentNode = view.state.selection.$from.node()
            if (currentNode.type.spec.code) return false

            if (html.length === 0 && text.length === 0) return false
            console.log('html', html)
            console.log('text', text)
            const domParser = DOMParser.fromSchema(schema)
            let dom
            if (html.length === 0) {
              const slice = parser?.(text)

              if (!slice || typeof slice === 'string') return false

              const res: Node[] = []
              slice.content.forEach((node, index) => {
                if (node.type.name === 'paragraph' && index === 0) {
                  node.content.forEach((child) => {
                    res.push(child)
                  })
                } else {
                  res.push(node)
                }
              })

              // Process images asynchronously
              this.processImagesInNodesAsync(res, view)

              // For multiple nodes, we need to replace with a fragment
              if (res.length === 1) {
                view.dispatch(view.state.tr.replaceSelectionWith(res[0], false))
              } else {
                const fragment = Fragment.from(res)
                view.dispatch(view.state.tr.replaceSelection(new Slice(fragment, 0, 0)))
              }

              return true
            } else {
              const template = document.createElement('template')
              template.innerHTML = html
              dom = template.content.cloneNode(true)
              template.remove()
            }

            const slice = domParser.parseSlice(dom)
            const node = isTextOnlySlice(slice)
            console.log('slice', slice, node)
            if (node) {
              // Even for text-only nodes, check if it's an image node
              if (
                (node.type.name === 'html_image' || node.type.name === 'md_image') &&
                node.attrs.src
              ) {
                this.processImageNode(node, view)
                view.dispatch(view.state.tr.replaceSelectionWith(node, true))
              } else {
                this.processMarkdownImageSyntax(node, view).then(() => {
                  view.dispatch(view.state.tr.replaceSelectionWith(node, true))
                })
              }

              return true
            }

            this.processImagesInSliceAsync(slice, view)

            view.dispatch(view.state.tr.replaceSelection(slice))
          })

          return true
        }
      },
      cut: (): CommandFunction => {
        return (props) => {
          if (props.tr.selection.empty) {
            return false
          }

          if (props.dispatch) {
            document.execCommand('cut')
          }

          return true
        }
      },
    }
  }

  /**
   * Process markdown image syntax in text nodes and update their src attributes using imageCopyHandler
   */
  private async processMarkdownImageSyntax(node: Node, view: EditorView) {
    const { imageCopyHandler } = this.options
    if (!imageCopyHandler) return

    // Regex to match markdown image syntax: ![alt](src "title")
    const imageRegex = new RegExp(getMdImageInputRule('md_image')[0]?.regexp, 'g')

    const processTextNode = async (n: Node) => {
      if (n.isText && n.text) {
        let match: RegExpExecArray | null
        imageRegex.lastIndex = 0 // Reset regex state

        while ((match = imageRegex.exec(n.text)) !== null) {
          const [, , src] = match
          if (src) {
            const newSrc = await imageCopyHandler(src)
            if (newSrc && newSrc !== src) {
              // @ts-ignore
              n.text = n.text!.replace(src, newSrc)
            }
          }
        }
      }

      // Process child nodes recursively
      if (n.content && n.content.size > 0) {
        n.content.forEach((child) => {
          processTextNode(child)
        })
      }
    }

    await processTextNode(node)
  }

  /**
   * Process a single image node asynchronously and update its src attribute using imageCopyHandler
   */
  private processImageNode(node: Node, view: EditorView): void {
    const { imageCopyHandler } = this.options
    if (!imageCopyHandler || !node.attrs.src) return

    // @ts-ignore
    node.attrs['data-rme-loading'] = 'true'

    // Call the imageCopyHandler to get the new src
    imageCopyHandler(node.attrs.src)
      .then((newSrc) => {
        if (newSrc && newSrc !== node.attrs.src) {
          // Find and update the image node in the document
          this.updateImageNodeSrc(view, node, newSrc)
        } else {
          const { state, dispatch } = view

          // @ts-ignore
          node.attrs['data-rme-loading'] = null
          dispatch(state.tr)
        }
      })
      .catch((error) => {
        console.warn('imageCopyHandler failed:', error)
      })
  }

  /**
   * Process images in a slice asynchronously and update their src attributes using imageCopyHandler
   */
  private processImagesInSliceAsync(slice: Slice, view: any): void {
    const { imageCopyHandler } = this.options
    if (!imageCopyHandler) return

    // Find all image nodes in the slice
    const imageNodes: { node: Node; pos: number }[] = []
    let currentPos = 0

    const findImageNodes = (node: Node, pos: number) => {
      if ((node.type.name === 'html_image' || node.type.name === 'md_image') && node.attrs.src) {
        imageNodes.push({ node, pos })
      }

      if (node.content && node.content.size > 0) {
        node.content.forEach((child, offset) => {
          findImageNodes(child, pos + offset + 1)
        })
      }
    }

    slice.content.forEach((node, offset) => {
      findImageNodes(node, currentPos + offset)
    })

    // Process each image node
    imageNodes.forEach(({ node, pos }) => {
      if (node.attrs.src) {
        this.processImageNode(node, view)
      }
    })
  }

  /**
   * Process images in an array of nodes asynchronously and update their src attributes using imageCopyHandler
   */
  private processImagesInNodesAsync(nodes: Node[], view: any): void {
    const { imageCopyHandler } = this.options
    if (!imageCopyHandler) return

    const processNode = (node: Node) => {
      // Check if node is an image node (both image and md_image)
      if ((node.type.name === 'html_image' || node.type.name === 'md_image') && node.attrs.src) {
        this.processImageNode(node, view)
      }

      // Process child nodes recursively
      if (node.content && node.content.size > 0) {
        node.content.forEach((child) => {
          processNode(child)
        })
      }
    }

    nodes.forEach(processNode)
  }

  /**
   * Update image node src attribute in the document
   */
  private updateImageNodeSrc(view: EditorView, node: Node, newSrc: string): void {
    const { state, dispatch } = view
    let tr = state.tr
    // @ts-ignore
    node.attrs.src = newSrc
    // @ts-ignore
    node.attrs['data-rme-loading'] = null
    dispatch(tr)
  }
}
