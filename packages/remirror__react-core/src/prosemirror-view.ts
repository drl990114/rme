import { DirectEditorProps, EditorView } from '@rme-sdk/pm/view';

/**
 * Creates a new editor view
 *
 * @param place
 * @param props
 */
export function createEditorView(
  place: Node | ((p: HTMLElement) => void) | null,
  props: DirectEditorProps,
): EditorView {
  return new EditorView(place, props);
}
