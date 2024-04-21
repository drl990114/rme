import { DOMCompatibleAttributes, DOMOutputSpec, extension, MarkExtension, MarkExtensionSpec } from 'remirror'
import { canCreateDomTagName } from '../Inline/from-inline-markdown'
import { MfImgOptions } from '../Inline'

export interface HtmlMarksSpec {
  tagName: string
  attrs: DOMCompatibleAttributes
}

@extension<MfImgOptions>({
  defaultOptions: {
    handleViewImgSrcUrl: async (src: string) => src,
  },
  staticKeys: [],
  handlerKeys: [],
  customHandlerKeys: [],
})
export class HtmlInlineMarks extends MarkExtension {
  static disableExtraAttributes = true
  get name() {
    return 'mdHtmlInline' as const
  }

  createMarkSpec(): MarkExtensionSpec {
    return {
      spanning: false,
      attrs: {
        depth: { default: 0 },
        first: { default: false },
        last: { default: false },
        htmlSpec: { default: [] },
      },
      toDOM: (mark) => {
        const htmlSpec = mark.attrs.htmlSpec.filter((spec: HtmlMarksSpec) =>
          canCreateDomTagName(spec.tagName),
        )

        if (htmlSpec.length >= 1) {
          const getDomSpec = (spec: HtmlMarksSpec[]): DOMOutputSpec => {
            const curSpec = spec[0]
            const res: any = [curSpec.tagName]
            if (curSpec.attrs) {
              res.push(curSpec.attrs)
            }

            if (spec.length > 1) {
              res.push(getDomSpec(spec.slice(1)))
            } else {
              res.push(0)
            }
            return res
          }

          return getDomSpec(htmlSpec)
        }

        return ['span']
      },
    }
  }
}
