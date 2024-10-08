/** @jsx jsx */
/** @jsxFrag React.Fragment */
/**
 * Items pertaining to extent data.
 *
 * Currently, extent is a common structure, but is not expressed
 * as a separate register item class.
 * Still, users may want to import an extent from another item.
 */

import update from 'immutability-helper';
import { jsx, css, ClassNames } from '@emotion/react';
import React from 'react';
import {
  Callout,
  InputGroup, ControlGroup, FormGroup, Button, TextArea,
  MenuItem, Tag, ProgressBar,
  Colors,
} from '@blueprintjs/core';
import { Select2 as Select, type ItemRenderer } from '@blueprintjs/select';
import { Tooltip2 as Tooltip } from '@blueprintjs/popover2';
import { useDebounce, DatasetContext } from '@riboseinc/paneron-extension-kit';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit';

import type {
  ItemClassConfiguration,
  ItemListView,
} from '@riboseinc/paneron-registry-kit/types';

import {
  type CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  COMMON_PROPERTIES,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  RelatedItem,
} from './common';


interface ExtentBoundingPolygonPoint {
  /** Latitude (+/-90, Northern hemisphere positive) */
  lat: number
  /** Longitude (+/-180, Eastern hemisphere positive) */
  lon: number
}

export interface Extent {
  n: string
  e: string
  s: string
  w: string
  name: string
  polygonPoints?: ExtentBoundingPolygonPoint[]

  /** Start date on which item is valid. */
  temporalExtentStartDate?: string

  /** End date on which item stops being valid. */
  temporalExtentEndDate?: string
}

/** A.k.a. “domain of validity”. */
export interface ExtentItemData extends CommonGRItemData {
  extent: Extent
}

const EXTENT_COORDS = ['n', 'e', 's', 'w'] as const;

function isExtent(val: any): val is Extent {
  return (
    val
    && EXTENT_COORDS.every(c => val.hasOwnProperty(c))
    && (EXTENT_COORDS.every(c => typeof val[c] === 'string')
      || EXTENT_COORDS.every(c => typeof val[c] === 'number')) // for backwards compatibility
    && val.hasOwnProperty('name')
    && typeof val.name === 'string'
  );
}

/** Placeholder/stub extent value. */
export const DEFAULT_EXTENT: Extent = { name: '', n: '0', e: '0', s: '0', w: '0' } as const;

export const EXTENT_DEFAULTS: ExtentItemData = {
  ...SHARED_DEFAULTS,
  extent: DEFAULT_EXTENT,
} as const;


/**
 * A widget for editing extent data.
 */
export const ExtentEdit: React.FC<{ extent: Extent, onChange?: (ext: Extent) => void }> =
function ({ extent, onChange }) {
  const isStub = JSON.stringify(extent) === JSON.stringify(DEFAULT_EXTENT);
  const { getMapReducedData } = React.useContext(DatasetContext);
  const [_allImportableExtents, setAllImportableExtents] = React.useState<SuggestedExtentListItem[] | undefined>(undefined);

  if (!isExtent(extent)) {
    throw new Error("Item given to ExtentEdit is not an extent");
  }

  const allImportableExtents = useDebounce(_allImportableExtents, 400);
  const extentsAreLoading = allImportableExtents === undefined;

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

  React.useEffect(() => {
    let cancelled = false;
    async function importExtents() {
      setAllImportableExtents(undefined);
      try {
        const result = await loadImportableExtents();
        if (cancelled) return;
        setAllImportableExtents(result);
      } catch (e) {
        if (cancelled) return;
        setAllImportableExtents([]);
      }
    }
    importExtents();
    return function cleanUp() { cancelled = true; };
  }, []);

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
      <PropertyDetailView label="Description">
        <TextArea
          readOnly={!onChange}
          onChange={(evt) => onChange!({ ...extent, name: evt.currentTarget.value })}
          placeholder={onChange ? "Extent description goes here" : undefined}
          value={extent.name ?? ''}
          css={css`margin-top: .5em; font-size: 90%; width: 100%;`}
        />
      </PropertyDetailView>
      <PropertyDetailView title="Bounding box">
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
                        items={allImportableExtents ?? []}
                        itemPredicate={extentMatchesQuery}
                        itemRenderer={renderSuggestedExtent}
                        noResults={<MenuItem
                          disabled
                          text={extentsAreLoading ? <ProgressBar /> : "No extents to show."}
                        />}
                        filterable={allImportableExtents && allImportableExtents.length > 7}
                        onItemSelect={handleImportSuggestedExtent}
                        popoverProps={{
                          minimal: true,
                          popoverClassName: `${css`.bp4-menu { max-height: 40vh; overflow-y: auto; }`}`,
                        }}>
                      <Button
                        title="Load extent data from a pre-existing item"
                        outlined
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
                      outlined
                      css={css`
                        padding: 0 20px;
                        /* Otherwise it gets compressed (due to fill presumably) */
                      `}
                      icon="reset" />
                : null}
            </ControlGroup>
          )}
        </ClassNames>
      </PropertyDetailView>
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
  value: string
  onChange?: (newVal: number) => void
  label?: JSX.Element
}> =
function ({ value, label, onChange }) {
  const [editedVal, editVal] = React.useState<string | null>(null);

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleChange = React.useCallback(function handleChange(val: string) {
    if (!onChange) {
      return;
    }
    try {
      onChange(parseCoordinate(val));
      editVal(null);
      inputRef.current?.setCustomValidity("");
      inputRef.current?.reportValidity();
    } catch (e) {
      editVal(val);
      inputRef.current?.setCustomValidity((e as any).message ?? "Unable to parse value");
      inputRef.current?.reportValidity();
    }
  }, [editVal, inputRef.current, onChange]);

  return (
    <FormGroup
        label={label}
        css={css`margin: 0;`}>
      <InputGroup
        readOnly={!onChange}
        inputRef={inputRef}
        onChange={(evt: React.FormEvent<HTMLInputElement>) =>
          handleChange(evt.currentTarget.value)}
        css={css`
          .bp4-input:valid {
            background: ${Colors.GREEN5};
            .bp4-dark & { background: ${Colors.GREEN2}; }
          }
          .bp4-input:invalid {
            background: ${Colors.RED5};
            .bp4-dark & { background: ${Colors.RED2}; }
          }
        `}
        value={editedVal ?? value}
      />
    </FormGroup>
  );
}


function parseCoordinate(val: string): number {
  let normalizedVal: string = val.trim();
  try {
    const candidate = parseFloat(normalizedVal);
    if (!isNaN(candidate) && candidate.toLocaleString() === normalizedVal && candidate <= 180 && candidate >= -180) {
      return candidate;
    } else {
      throw new Error("Coordinate value may be malformed");
    }
  } catch (e) {
    throw new Error("Unable to parse coordinate value");
  }
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
    return <Tooltip
      placement='left'
      key={item.extentData.name}
      content={`From ${item.registerItemDescription}`}
      hoverOpenDelay={0}
      transitionDuration={0}
      renderTarget={({ isOpen, ref, ...targetProps }) =>
        <MenuItem
          {...targetProps}
          elementRef={ref}
          css={css`overflow: hidden; text-overflow: ellipsis; max-width: 500px;`}
          text={item.extentData.name?.trim() || '(unnamed extent)'}
          title={`${item.extentData.name} — from item ${item.registerItemDescription}`}
          disabled={modifiers.disabled}
          active={modifiers.active}
          onClick={handleClick}
          onFocus={handleFocus}
          roleStructure='listoption'
          key={item.extentData.name}
        />}
    />;
  } else {
    return null;
  }
}

const EXTENT_MAP_FUNC = `
  if (value?.data?.extent) {
    emit({
      extentData: value.data.extent,
      registerItemDescription: '#' + value.data.identifier + ' (' + (value.data.name ?? 'unknown name') + ')',
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


// Item class definition

export const extent: ItemClassConfiguration<ExtentItemData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Extent",
    description: "Geographic area or region. Also known as “domain of validity”.",
    id: 'extent',
    alternativeNames: [] as const,
  },
  defaults: {
    ...SHARED_DEFAULTS,
    extent: DEFAULT_EXTENT,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<ExtentItemData>,
    editView: (props) => (
      <CommonEditView
          useRegisterItemData={props.useRegisterItemData}
          getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
          itemData={props.itemData}
          itemRef={props.itemRef}
          hideRemarks hideAliases hideInfoSources
          onChange={props.onChange ? (newData: CommonGRItemData) => {
            if (!props.onChange) { return; }
            props.onChange({ ...props.itemData, ...newData });
          } : undefined}>

        <ExtentEdit
          extent={props.itemData.extent}
          onChange={props.onChange
            ? (extent) => props.onChange!(update(props.itemData, { extent: { $set: extent } }))
            : undefined}
        />

        {props.children}

      </CommonEditView>
    ),
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};

/**
 * A widget combining two widgets,
 * one for legacy extent data and one for extent reference.
 *
 * Legacy extent data is read-only regardless of `onChange` prop.
 */
export const CombinedExtentWidget: React.VoidFunctionComponent<{
  /**
   * Legacy extent information.
   * If undefined, legacy extent widget is not shown.
   */
  extent?: Extent

  /** Extent item reference. */
  extentRef?: string

  /**
   * If provided, editing extent reference can be changed,
   * upon which this callback is invoked.
   */
  onRefChange?: (ref: string | undefined) => void
}> = function ({ extent, extentRef, onRefChange }) {
  return (
    <>

      <PropertyDetailView
          label="Extent"
          labelInfo="(new)">
        <RelatedItem
          itemRef={extentRef ? { classID: 'extent', itemID: extentRef } : undefined}
          mode="id"
          classIDs={['extent']}
          onClear={onRefChange ? () => onRefChange!(undefined) : undefined}
          onSet={onRefChange ? (spec) => onRefChange!(spec.$set) : undefined}
        />
      </PropertyDetailView>

      {extent !== undefined
        ? <Callout css={css`padding-bottom: 0;`}>
            <PropertyDetailView
                label="Extent"
                labelInfo="(legacy)">
              <ExtentEdit extent={extent} />
            </PropertyDetailView>
          </Callout>
        : null}

    </>
  );
};
