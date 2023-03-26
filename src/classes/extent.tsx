/** @jsx jsx */
/** @jsxFrag React.Fragment */
/**
 * Items pertaining to extent data.
 *
 * Currently, extent is a common structure, but is not expressed
 * as a separate register item class.
 * Still, users may want to import an extent from another item.
 */

import { jsx, css, ClassNames } from '@emotion/react';
import React, { useContext, useState, useEffect } from 'react';
import {
  InputGroup, ControlGroup, FormGroup, Button, TextArea,
  MenuItem, Tag, Icon,
} from '@blueprintjs/core';
import { Select2 as Select, ItemRenderer } from '@blueprintjs/select';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import useDebounce from '@riboseinc/paneron-extension-kit/useDebounce';


export interface Extent {
  n: number
  e: number
  s: number
  w: number
  name: string
}
const EXTENT_COORDS = ['n', 'e', 's', 'w'] as const;

function isExtent(val: any): val is Extent {
  return (
    val
    && EXTENT_COORDS.every(c => val.hasOwnProperty(c))
    && EXTENT_COORDS.every(c => typeof val[c] === 'number')
    && val.hasOwnProperty('name')
    && typeof val.name === 'string'
  );
}

/** Placeholder/stub extent value. */
export const DEFAULT_EXTENT: Extent = { name: '', n: 0, e: 0, s: 0, w: 0 };

// const IMPORTABLE_EXTENT_FILTER_QUERY_MIN_CHARS = 3;

/**
 * A widget for editing extent data.
 * There is no “detail” extent widget; simply use this one without `onChange()`.
 */
export const ExtentEdit: React.FC<{ extent: Extent, onChange?: (ext: Extent) => void }> =
function ({ extent, onChange }) {
  const isStub = JSON.stringify(extent) === JSON.stringify(DEFAULT_EXTENT);
  const { getMapReducedData, operationKey } = useContext(DatasetContext);

  const isBusy = operationKey !== undefined;

  const [importableExtentFilterQuery, setImportableExtentFilterQuery] = useState<string>('');
  const [allImportableExtents, setAllImportableExtents] = useState<SuggestedExtentListItem[]>([]);
  const importableExtentFilterQueryDebounced = useDebounce(importableExtentFilterQuery, 500);
  //const hasExtentQuery = importableExtentFilterQuery.trim().length >= IMPORTABLE_EXTENT_FILTER_QUERY_MIN_CHARS;

  async function loadImportableExtents() {
    const data = await getMapReducedData({ chains: { extents: {
      mapFunc: EXTENT_MAP_FUNC,
      reduceFunc: EXTENT_REDUCE_FUNC,
    } } });

    const result = (data.extents ?? []).filter(isSuggestedExtentListItem);
    if (result.length < 1) {
      throw new Error("No extents were found across items in the register");
    } else {
      return data.extents;
    }
  }

  useEffect(() => {
    let cancelled = false;
    if (!cancelled && !isBusy && onChange &&
        //importableExtentFilterQueryDebounced.trim().length >= IMPORTABLE_EXTENT_FILTER_QUERY_MIN_CHARS &&
        allImportableExtents.length < 1) {
      loadImportableExtents().
      then((
        (extents) => {
          if (!cancelled) { setAllImportableExtents(extents); }
        }), (
          () => { setImportableExtentFilterQuery('') }
        ));
    }
    return () => {
      cancelled = true;
    };
  }, [importableExtentFilterQueryDebounced, allImportableExtents.length < 1]);

  function handleImportSuggestedExtent(item: SuggestedExtentListItem) {
    if (onChange && isExtent(item.extentData)) {
      onChange(item.extentData);
    }
  }

  function extentInput(side: 'n' | 'e' | 's' | 'w') {
    const nm = side === 'n' || side === 's' ? 'Lat' : 'Lon';

    return (
      <CoordInput
        key={side}
        onChange={onChange
          ? (val) => onChange!({ ...extent, [side]: val })
          : undefined}
        label={<>{side.toUpperCase()}&ensp;<Tag minimal round>{nm}</Tag></>}
        value={extent[side] ?? 0}
      />
    );
  }

  return (
    <>
      <ClassNames>
        {({ css, cx }) => (
          <ControlGroup
              fill
              css={css`
                align-items: flex-end;
                /* Avoid stretching the load button; align it with inputs */
              `}>
            {extentInput('n')}
            {extentInput('e')}
            {extentInput('s')}
            {extentInput('w')}
            {onChange
              ? isStub
                ? <Select<SuggestedExtentListItem>
                      items={allImportableExtents}
                      itemPredicate={extentMatchesQuery}
                      itemRenderer={renderSuggestedExtent}
                      onItemSelect={handleImportSuggestedExtent}
                      popoverProps={{
                        minimal: true,
                        popoverClassName: `${css`.bp4-menu { max-height: 40vh; overflow-y: auto; }`}`,
                      }}>
                    <Button
                      title="Load extent data from a pre-existing item"
                      css={css`
                        padding: 0 20px;
                        /* Otherwise it gets compressed (due to fill presumably) */
                      `}
                      icon='folder-open'
                    />
                  </Select>
                : <Button
                    title="Clear extent data. If you want to import another extent, use this first"
                    onClick={() => onChange(DEFAULT_EXTENT)}
                    css={css`
                      padding: 0 20px;
                      /* Otherwise it gets compressed (due to fill presumably) */
                    `}
                    icon="reset" />
              : null}
          </ControlGroup>
        )}
      </ClassNames>
      <TextArea
        disabled={!onChange}
        onChange={(evt) => onChange!({ ...extent, name: evt.currentTarget.value })}
        placeholder={onChange ? "Extent description goes here" : undefined}
        value={extent.name ?? ''}
        css={css`margin-top: .5em; font-size: 90%; width: 100%;`}
      />
    </>
  );
};


/**
 * Blueprint’s `InputGroup` minimally wrapped for entering coordinates.
 *
 * - Does not fire `onChange()` unless a valid value is provided.
 * - If `onChange()` is provided, value validity is indicated by background tint
 *   and extra icon.
 */
const CoordInput: React.FC<{
  value: number
  onChange?: (newVal: number) => void
  label?: JSX.Element
}> =
function ({ value, label, onChange }) {

  const [editedVal, editVal] = useState<string | null>(null);
  const [valid, setValid] = useState(true);

  function handleChange(val: string) {
    if (!onChange) {
      return;
    }
    let normalizedVal: string = val.trim();
    try {
      const candidate = parseFloat(normalizedVal);
      if (!isNaN(candidate) && candidate.toLocaleString() === normalizedVal) {
        setValid(true);
        onChange(candidate);
        editVal(null);
      } else {
        editVal(normalizedVal);
        setValid(false);
      }
    } catch (e) {
      editVal(normalizedVal);
      setValid(false);
    }
  }

  return (
    <FormGroup
        label={label}
        css={css`margin: 0;`}
        labelInfo={onChange && !valid
          ? <Icon icon='warning-sign' title="Invalid value" />
          : undefined}
        intent={onChange && !valid
          ? 'warning'
          : undefined}>
      <InputGroup
        readOnly={!onChange}
        onChange={(evt: React.FormEvent<HTMLInputElement>) =>
          handleChange(evt.currentTarget.value)}
        css={onChange
          ? css`.bp4-input { ${valid ? 'background: honeydew' : 'background: mistyrose'} }`
          : undefined}
        value={editedVal ?? value.toLocaleString()}
      />
    </FormGroup>
  );
}


// Units for working with extent import menu

/**
 * Data model for Blueprint’s Select
 * used to filter extents when importing.
 */
interface SuggestedExtentListItem {
  extentData: Extent
  registerItemDescription: string

  /**
   * This property caches data from other properties
   * as a lower-case string that can be used during filtering.
   */
  searchableString: string
}
function isSuggestedExtentListItem(val: any): val is SuggestedExtentListItem {
  return (
    val
    && isExtent(val?.extentData)
    && typeof val?.registerItemDescription == 'string'
    && typeof val?.searchableString == 'string'
  );
}

/** ItemPredicate for use with Blueprint’s Select. */
function extentMatchesQuery(query: string, item: SuggestedExtentListItem) {
  return item.searchableString.indexOf(query.toLowerCase()) >= 0;
}

const renderSuggestedExtent: ItemRenderer<SuggestedExtentListItem> =
function (item, { handleClick, handleFocus, modifiers, query }) {
  if (modifiers.matchesPredicate) {
    return <MenuItem
      css={css`overflow: hidden; text-overflow: ellipsis; max-width: 500px;`}
      text={item.extentData.name?.trim() || '(unnamed extent)'}
      title={`${item.extentData.name} — from item ${item.registerItemDescription}`}
      disabled={modifiers.disabled}
      active={modifiers.active}
      onClick={handleClick}
      onFocus={handleFocus}
      roleStructure='listoption'
      key={item.extentData.name}
    />;
  } else {
    return null;
  }
}

const EXTENT_MAP_FUNC = `
  if (value?.data?.extent) {
    emit({
      extentData: value.data.extent,
      registerItemDescription: 'Item with ID ' + value.data.identifier + '',
      searchableString: [
        value.data.name ?? '',
        value.data.description ?? '',
        value.data.remarks ?? '',
        value.data.extent.name,
      ].join(' ').toLowerCase(),
    });
  }
`;
const EXTENT_REDUCE_FUNC = `
  if (!accumulator.find) {
    return value ? [accumulator, value] : [accumulator];
  } else if (!accumulator.find(v => v.extentData.name === value.extentData.name)) {
    return [...accumulator, value];
  } else {
    return accumulator;
  }
`;
