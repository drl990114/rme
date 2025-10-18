import { Plugin, PluginKey, type PluginView } from '@rme-sdk/pm/state';
import type { EditorView } from '@rme-sdk/pm/view';
import type { NodeIndicatorPluginOptions, NodeIndicatorState } from './types';

/**
 * 节点指示器插件键
 */
export const pluginKey = new PluginKey<NodeIndicatorState>('nodeIndicator');
