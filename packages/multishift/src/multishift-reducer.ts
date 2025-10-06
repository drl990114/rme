import { assertGet, isEmptyArray, object } from '@remirror/core-helpers';

import { MultishiftActionTypes } from './multishift-constants';
import type {
  MultishiftProps,
  MultishiftRootActions,
  MultishiftState,
  MultishiftStateProps,
} from './multishift-types';
import {
  addItems,
  defaultGetItemId,
  getChangesFromInputKeyDown,
  getChangesFromItemClick,
  getChangesFromMenuKeyDown,
  getChangesFromToggleButtonKeyDown,
  getDefaultState,
  getHighlightedIndexes,
  getHighlightedIndexOnOpen,
  getHighlightReset,
  getItemIndexesByJumpText,
  omitUnchangedState,
  removeItems,
  warnIfInternalType,
} from './multishift-utils';

export const multishiftReducer = <Item = any>(
  state: MultishiftState<Item>,
  action: MultishiftRootActions<Item>,
  props: MultishiftProps<Item>,
): [MultishiftState<Item>, MultishiftStateProps<Item>] => {
  let changes: MultishiftStateProps<Item> = object();

  const defaultState = getDefaultState(props);
  const {
    multiple,
    items,
    getItemId = defaultGetItemId,
    autoSelectOnBlur = true,
    itemToString,
    initialHighlightedIndexes,
  } = props;
  const highlightReset = getHighlightReset(defaultState);

  switch (action.type) {
    case MultishiftActionTypes.SelectItems:
    case MultishiftActionTypes.SelectItem: {
      const extra = action.payload.keepHighlights ? {} : highlightReset;
      changes = {
        ...extra,
        selectedItems: addItems(state.selectedItems, action.payload.items, getItemId, multiple),
      };
      break;
    }
    case MultishiftActionTypes.RemoveSelectedItems:
    case MultishiftActionTypes.RemoveSelectedItem: {
      const extra = action.payload.keepHighlights ? {} : highlightReset;
      changes = {
        ...extra,
        selectedItems: removeItems(state.selectedItems, action.payload.items, getItemId),
      };

      break;
    }
    case MultishiftActionTypes.ClearSelection:
      changes = {
        ...highlightReset,
        selectedItems: [],
      };
      break;

    case MultishiftActionTypes.SetHoverItemIndex:
      changes = {
        ...state,
        hoveredIndex: action.payload,
      };
      break;

    case MultishiftActionTypes.ItemMouseMove:
      changes = {
        hoveredIndex: action.payload,
      };
      break;

    case MultishiftActionTypes.ItemMouseLeave:
      changes =
        state.hoveredIndex === action.payload
          ? {
              hoveredIndex: defaultState.hoveredIndex,
            }
          : {};
      break;

    case MultishiftActionTypes.ItemClick: {
      const { modifiers, index } = action.payload;
      changes = getChangesFromItemClick({
        defaultState,
        state,
        index,
        items,
        modifiers,
        props,
        getItemId,
      });
      break;
    }

    case MultishiftActionTypes.InputBlur:
    case MultishiftActionTypes.ToggleButtonBlur:
    case MultishiftActionTypes.MenuBlur: {
      const {
        highlightedIndexes,
        selectedItems: selected,
        highlightedGroupStartIndex,
        highlightedGroupEndIndex,
      } = state;
      const indexes = getHighlightedIndexes({
        start: highlightedGroupStartIndex,
        end: highlightedGroupEndIndex,
        indexes: highlightedIndexes,
        items,
      });

      const extra =
        !isEmptyArray(indexes) && autoSelectOnBlur
          ? {
              selectedItems: addItems(
                selected,
                indexes.map((index) => assertGet(items, index)),
                getItemId,
                multiple,
              ),
            }
          : {};

      changes = omitUnchangedState(
        {
          isOpen: defaultState.isOpen,
          highlightedIndexes: defaultState.highlightedIndexes,
          highlightedGroupEndIndex: defaultState.highlightedGroupEndIndex,
          highlightedGroupStartIndex: defaultState.highlightedGroupStartIndex,
          hoveredIndex: defaultState.hoveredIndex,
          jumpText: defaultState.jumpText,
          ...extra,
        },
        { state, getItemId },
      );
      break;
    }

    case MultishiftActionTypes.MenuSpecialKeyDown: {
      const { key, modifiers, disabled } = action.payload;
      changes = getChangesFromMenuKeyDown({
        defaultState,
        items,
        key,
        modifiers,
        props,
        state,
        getItemId,
        disabled,
      });
      break;
    }

    case MultishiftActionTypes.ToggleButtonSpecialKeyDown: {
      const { key, modifiers, disabled } = action.payload;
      changes = getChangesFromToggleButtonKeyDown({
        defaultState,
        items,
        key,
        modifiers,
        props,
        state,
        getItemId,
        disabled,
      });
      break;
    }

    case MultishiftActionTypes.InputSpecialKeyDown: {
      const { key, modifiers, disabled } = action.payload;
      changes = getChangesFromInputKeyDown({
        defaultState,
        items,
        key,
        modifiers,
        props,
        state,
        getItemId,
        disabled,
      });
      break;
    }

    case MultishiftActionTypes.MenuCharacterKeyDown: {
      const jumpText = `${state.jumpText}${action.payload}`;
      const indexes = getItemIndexesByJumpText({
        text: jumpText,
        highlightedIndexes: state.highlightedIndexes,
        itemToString,
        items,
      });
      const extraHighlights = !isEmptyArray(indexes) ? { highlightedIndexes: indexes } : {};

      changes = omitUnchangedState({ jumpText, ...extraHighlights }, { state, getItemId });
      break;
    }

    case MultishiftActionTypes.ToggleButtonClick:
    case MultishiftActionTypes.ToggleMenu: {
      const indexes = getHighlightedIndexOnOpen(
        {
          defaultHighlightedIndexes: defaultState.highlightedIndexes,
          initialHighlightedIndexes: initialHighlightedIndexes,
          items,
        },
        state,
        0,
        getItemId,
      );

      changes = {
        isOpen: !state.isOpen,
        highlightedIndexes: state.isOpen ? [] : indexes,
      };
      break;
    }

    case MultishiftActionTypes.OpenMenu: {
      const highlightedIndexes = getHighlightedIndexOnOpen(
        {
          defaultHighlightedIndexes: defaultState.highlightedIndexes,
          initialHighlightedIndexes: initialHighlightedIndexes,
          items,
        },
        state,
        0,
        getItemId,
      );
      changes = {
        isOpen: true,
        highlightedIndexes,
        highlightedGroupEndIndex: undefined,
        highlightedGroupStartIndex: -1,
      };
      break;
    }

    case MultishiftActionTypes.CloseMenu:
      changes = {
        isOpen: false,
      };
      break;

    case MultishiftActionTypes.SetHighlightedIndexes:
    case MultishiftActionTypes.SetHighlightedIndex:
      changes = {
        highlightedIndexes: action.payload,
      };
      break;

    case MultishiftActionTypes.ClearHighlighted:
      changes = getHighlightReset(defaultState);
      break;

    case MultishiftActionTypes.ClearJumpText:
      changes = {
        jumpText: '',
      };
      break;

    case MultishiftActionTypes.OuterMouseUp:
    case MultishiftActionTypes.OuterTouchEnd: {
      const {
        highlightedIndexes,
        selectedItems: selected,
        highlightedGroupEndIndex,
        highlightedGroupStartIndex,
      } = state;
      const indexes = getHighlightedIndexes({
        start: highlightedGroupStartIndex,
        end: highlightedGroupEndIndex,
        indexes: highlightedIndexes,
        items,
      });
      const highlightedItems = indexes.map((index) => assertGet(items, index));
      const extra =
        !isEmptyArray(indexes) && autoSelectOnBlur
          ? { selectedItems: addItems(selected, highlightedItems, getItemId, multiple) }
          : {};
      changes = {
        ...extra,
        isOpen: false,
        ...highlightReset,
      };
      break;
    }
    case MultishiftActionTypes.Reset:
      changes = defaultState;
      break;

    case MultishiftActionTypes.InputValueChange:
      changes = {
        ...getHighlightReset(defaultState),
        isOpen: true,
        inputValue: action.payload,
        jumpText: defaultState.jumpText,
      };
      break;

    case MultishiftActionTypes.SetState:
      changes = {
        ...action.payload,
      };
      break;

    default:
      warnIfInternalType((action as any).type, 'All internal action types need to be managed');
  }

  return [{ ...state, ...changes }, changes];
};
