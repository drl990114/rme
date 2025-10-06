import { HorizontalRuleExtension } from 'remirror/extensions'

import { ExtensionCommandReturn, setBlockType } from 'remirror'
import type { NodeSerializerOptions } from '../../transform'
import { ParserRuleType } from '../../transform'

export class LineHorizontalRuleExtension extends HorizontalRuleExtension {
  createCommands(): ExtensionCommandReturn {
    return {
      createHorizontalRule: () => ({ tr, dispatch }) => {
        if (dispatch) {
          setBlockType(this.type)
        }
        return true
      },
    }
  }

  fromMarkdown() {
    return [
      {
        type: ParserRuleType.block,
        token: 'hr',
        node: this.name,
        hasOpenClose: false,
      },
    ] as const
  }
  toMarkdown({ state, node }: NodeSerializerOptions) {
    state.write('---')
    state.closeBlock(node)
  }
}
