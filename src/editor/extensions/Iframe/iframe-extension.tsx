import { parse, stringify } from 'querystringify'
import type {
  ApplySchemaAttributes,
  CommandFunction,
  InputRule,
  LiteralUnion,
  NodeExtensionSpec,
  NodeSpecOverride,
  ProsemirrorAttributes,
  Shape} from '@remirror/core'
import {
  command,
  cx,
  extension,
  ExtensionTag,
  findSelectedNodeOfType,
  NodeExtension,
  nodeInputRule,
  object,
  omitExtraAttributes
} from '@remirror/core'
import type { NodeViewComponentProps } from '@remirror/react'
import type { ComponentType } from 'react'
import type { IframeOptions } from './iframe-types'
import { IframeNodeView } from './Iframe-nodeview'
import type { NodeSerializerOptions} from '@/editor/transform'
import { ParserRuleType } from '@/editor/transform'
import { buildHtmlStringFromAst, getAttrsBySignalHtmlContent } from '@/editor/utils/html'

export type IframeAttributes = ProsemirrorAttributes<{
  src: string;
  frameBorder?: number | string;
  allowFullScreen?: 'true' | boolean;
  width?: number;
  height?: number;
  type?: LiteralUnion<'youtube', string>;
}>;

/**
 * An extension for the remirror editor.
 */
@extension<IframeOptions>({
  defaultOptions: {
    defaultSource: '',
    class: 'remirror-iframe',
    enableResizing: false,
  },
  staticKeys: ['defaultSource', 'class'],
  handlerKeys: [],
  customHandlerKeys: []
})
export class IframeExtension extends NodeExtension<IframeOptions> {
  get name() {
    return 'iframe_inline' as const
  }

  createTags() {
    return [ExtensionTag.InlineNode, ExtensionTag.Media]
  }

  ReactComponent: ComponentType<NodeViewComponentProps> | undefined = (props) => {
    return  <IframeNodeView {...props}/>
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    const { defaultSource } = this.options

    return {
      inline: true,
      selectable: true,
      atom: true,
      ...override,
      attrs: {
        ...extra.defaults(),
        src: defaultSource ? { default: defaultSource } : {},
        allowFullScreen: { default: true },
        frameBorder: { default: 0 },
        type: { default: 'custom' },
        width: { default: null },
        height: { default: null },
      },
      parseDOM: [
        {
          tag: 'iframe',
          getAttrs: (dom): IframeAttributes => {
            const frameBorder = (dom as HTMLElement).getAttribute('frameborder')
            const width = (dom as HTMLElement).getAttribute('width')
            const height = (dom as HTMLElement).getAttribute('height')
            return {
              ...extra.parse(dom),
              type: (dom as HTMLElement).getAttribute('data-embed-type') ?? undefined,
              height: (height && Number.parseInt(height, 10)) || undefined,
              width: (width && Number.parseInt(width, 10)) || undefined,
              allowFullScreen:
                (dom as HTMLElement).getAttribute('allowfullscreen') === 'false' ? false : true,
              frameBorder: frameBorder ? Number.parseInt(frameBorder, 10) : 0,
              src: (dom as HTMLElement).getAttribute('src') ?? '',
            }
          },
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        const { frameBorder, allowFullScreen, src, type, ...rest } = omitExtraAttributes(
          node.attrs,
          extra,
        )
        const { class: className } = this.options

        return [
          'iframe',
          {
            ...extra.dom(node),
            ...rest,
            class: cx(className, `${className}-${type as string}`),
            src,
            'data-embed-type': type,
            allowfullscreen: allowFullScreen ? 'true' : 'false',
            frameBorder: frameBorder?.toString(),
          },
        ]
      },
    }
  }

  /**
   * Add a custom iFrame to the editor.
   */
  @command()
  addIframe(attributes: IframeAttributes): CommandFunction {
    return ({ tr, dispatch }) => {
      dispatch?.(tr.replaceSelectionWith(this.type.create(attributes)))

      return true
    }
  }

  /**
   * Add a YouTube embedded iFrame to the editor.
   */
  @command()
  addYouTubeVideo(props: CreateYouTubeIframeProps): CommandFunction {
    return this.addIframe({
      src: createYouTubeUrl(props),
      frameBorder: 0,
      type: 'youtube',
      allowFullScreen: 'true',
    })
  }

  /**
   * Update the iFrame source for the currently selected video.
   */
  @command()
  updateIframeSource(src: string): CommandFunction {
    return ({ tr, dispatch }) => {
      const iframeNode = findSelectedNodeOfType({ selection: tr.selection, types: this.type })

      // Selected node is NOT an iframe node, return false indicating this command is NOT enabled
      if (!iframeNode) {
        return false
      }

      // Call dispatch method if present (using optional chaining), to modify the actual document
      dispatch?.(tr.setNodeMarkup(iframeNode.pos, undefined, { ...iframeNode.node.attrs, src }))

      // Return true, indicating this command IS enabled
      return true
    }
  }

  /**
   * Update the YouTube video iFrame.
   */
  @command()
  updateYouTubeVideo(props: CreateYouTubeIframeProps): CommandFunction {
    return this.updateIframeSource(createYouTubeUrl(props))
  }

  createInputRules(): InputRule[] {
    const rules: InputRule[] = [
      nodeInputRule({
        regexp: new RegExp('<iframe[^>]*>'),
        type: this.type,
        getAttributes: (match) => {
          return getAttrsBySignalHtmlContent(match[0])
        },
      }),
    ]

    return rules
  }

  public fromMarkdown() {
    return [
      {
        type: ParserRuleType.inline,
        token: 'iframe_inline',
        node: this.name,
      },
    ] as const
  }

  public toMarkdown({ state, node }: NodeSerializerOptions) {
    state.text(
      buildHtmlStringFromAst({
        tag: 'iframe',
        attrs: node.attrs,
        voidElement: true,
      }),
      false,
    )
  }
}

interface CreateYouTubeIframeProps {
  /**
   * The video id (dQw4w9WgXcQ) or full link
   * (https://www.youtube.com/watch?v=dQw4w9WgXcQ).
   */
  video: string;

  /**
   * The number os seconds in to start at.
   * @defaultValue 0
   */
  startAt?: number;

  /**
   * When true will show the player controls.
   *
   * @defaultValue true
   */
  showControls?: boolean;

  /**
   * According to YouTube: _When you turn on privacy-enhanced mode, YouTube
   * won't store information about visitors on your website unless they play the
   * video._
   *
   * @defaultValue true
   */
  enhancedPrivacy?: boolean;
}

/**
 * A Url parser that relies on the browser for the majority of the work.
 */
function parseUrl<Query extends Shape = Shape>(url: string) {
  const parser = document.createElement('a')

  // Let the browser do the work
  parser.href = url

  const searchObject = parse(parser.search) as Query

  return {
    protocol: parser.protocol,
    host: parser.host,
    hostname: parser.hostname,
    port: parser.port,
    pathname: parser.pathname,
    search: parser.search,
    searchObject,
    hash: parser.hash,
  }
}

function createYouTubeUrl(props: CreateYouTubeIframeProps) {
  const { video, enhancedPrivacy = true, showControls = true, startAt = 0 } = props
  const id: string = parseUrl<{ v?: string }>(video)?.searchObject?.v ?? video
  const urlStart = enhancedPrivacy ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com'
  const searchObject = object<Shape>()

  if (!showControls) {
    searchObject.controls = '0'
  }

  if (startAt) {
    searchObject['amp;start'] = startAt
  }

  return `${urlStart}/embed/${id}?${stringify(searchObject)}`
}
