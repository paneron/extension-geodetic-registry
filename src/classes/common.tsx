/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update, { type Spec } from 'immutability-helper';
import React from 'react';
import { jsx, css } from '@emotion/react';

import {
  Button,
  ButtonGroup,
  Callout,
  ControlGroup,
  InputGroup,
  Colors,
  NumericInput,
  TextArea,
  OL,
  UL,
} from '@blueprintjs/core';

import type {
  Citation,
  ItemClassConfiguration,
  ItemEditViewProps,
  InternalItemReference,
} from '@riboseinc/paneron-registry-kit/types';
import { GenericRelatedItemView, PropertyDetailView } from '@riboseinc/paneron-registry-kit';


export interface CommonGRItemData {
  name: string
  identifier: number
  remarks: string
  informationSources: Readonly<Citation[]>
  aliases: Readonly<string[]>
}


export const DEFAULTS: Readonly<CommonGRItemData> = Object.freeze({
  name: "Unnamed item",
  // Non-positive identifiers are replaced with next available positive integers
  // in afterApprovedCR hook.
  identifier: 0,
  informationSources: [],
  remarks: '',
  aliases: [],
});


export function getInformationSourceStub(): Readonly<Citation> {
  return {
    title: "Untitled citation",
    revisionDate: null,
    publicationDate: null,
    seriesIssueID: null,
    seriesName: null,
    seriesPage: null,
    edition: null,
    editionDate: null,
    otherDetails: '',
    isbn: null,
    issn: null,
  } as const;
}


// /** @deprecated: use AliasesEdit without onChange */
// const AliasesDetail: React.FC<{ aliases: string[] }> = function ({ aliases }) {
//   return <PropertyDetailView title="Aliases">
//     <UL>
//       {aliases.map((a, idx) => <li key={idx}>{a}</li>)}
//     </UL>
//   </PropertyDetailView>;
// };


const AliasesEdit: React.FC<{
  aliases: Readonly<string[]>
  onChange?: (newAliases: Readonly<string[]>) => void
}> = function ({ aliases, onChange }) {
  return (
    <ItemList
      items={aliases}
      hideOrdinals
      simpleItems
      itemLabel="alias"
      itemLabelPlural="aliases"
      subLabel="Alternative names for this item."
      onChangeItems={onChange
        ? (spec) => onChange!(update(aliases, spec))
        : undefined}
      placeholderItem=""
      itemRenderer={(alias, idx, handleChange, deleteButton) =>
        <InputGroup
          key={idx}
          fill
          required
          value={alias}
          readOnly={!handleChange}
          rightElement={deleteButton}
          onChange={(evt) => handleChange!({ $set: evt.currentTarget.value })}
        />
      }
    />
  );
};


export const COMMON_PROPERTIES: Pick<ItemClassConfiguration<CommonGRItemData>, 'itemSorter'> = {
  itemSorter: (a, b) => a.identifier - b.identifier,
} as const;


export const EditView: React.FC<ItemEditViewProps<CommonGRItemData> & {
  hideRemarks?: boolean,
  hideAliases?: boolean,
}> = function (props) {
  const { itemData, onChange, children } = props;

  function textInputProps
  <F extends keyof Omit<CommonGRItemData, 'informationSource'>>
  (fieldName: F) {
    return {
      readOnly: !onChange,
      onChange: (evt: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!onChange) { return; }
        onChange({ ...itemData, [fieldName]: evt.currentTarget.value })
      },
    }
  }

  return (
    <div>

      <div css={css`display: flex; flex-flow: row nowrap; gap: 20px;`}>

        <PropertyDetailView
            label="GR identifier"
            css={css`width: 16em;`}
            helperText={onChange
              ? "Unique across all item classes in this register. For not-yet-accepted items, must not be a positive integer."
              : undefined}>
          <ControlGroup>
            <NumericInput
              required
              value={itemData.identifier}
              css={css`.bp4-input-group { width: 6em; }`}
              buttonPosition="none"
              readOnly
              min={-Infinity}
              max={Infinity}
            />
          </ControlGroup>
        </PropertyDetailView>

        <PropertyDetailView
            label="Name"
            css={css`flex-grow: 1;`}
            helperText={onChange
              ? "Unique name for the item in this register."
              : undefined}>
          <InputGroup required value={itemData.name} {...textInputProps('name')} />
        </PropertyDetailView>

      </div>

      {props.hideAliases
        ? null
        : <AliasesEdit
            aliases={itemData.aliases}
            onChange={onChange
              ? (newAliases) => onChange!(update(itemData, { aliases: { $set: newAliases } } ))
              : undefined}
          />}


      {props.hideRemarks
        ? null
        : <PropertyDetailView
              title="Remarks"
              subLabel="Comments on or information about this item.">
            <TextArea fill required value={itemData.remarks ?? ''} {...textInputProps('remarks')} />
          </PropertyDetailView>}

      {children}

      <ItemList
        items={itemData.informationSources}
        itemLabel="citation (information source)"
        itemLabelPlural="citations"
        subLabel="Source citation information — ISO 19115 B 3.2.1"
        placeholderItem={getInformationSourceStub()}
        onChangeItems={onChange
          ? (spec) => onChange!(update(itemData, { informationSources: spec }))
          : undefined}
        itemRenderer={function renderCitation (item, _idx, handleChange, deleteButton) {
          return <PropertyDetailView helperText={deleteButton}>
            <InformationSourceEdit
              citation={item}
              onChange={handleChange
                ? (newSource) => handleChange({ $set: newSource })
                : undefined}
              />
          </PropertyDetailView>
        }}
      />

    </div>
  );
};



interface RelatedItemWidgetProps<M extends 'generic' | 'id', S> {
  /** Determines whether only item ID or full internal reference is set. */
  mode: M

  itemRef?: InternalItemReference

  /**
   * Restrict the choice of related item classes.
   * `mode === 'id'` means only one class can be specified.
   */
  classIDs: M extends 'generic' ? (undefined | string[]) : ([string] | [])

  onSet?: (spec: { $set: S }) => void

  onClear?: () => void

  fill?: boolean

  validity?: string
}

/**
 * A clumsy wrapper around GenericRelatedItemView
 * for handling generic and non-generic relations.
 */
export function RelatedItem<
  M extends 'generic' | 'id',
  S extends M extends 'generic' ? InternalItemReference : string
>({
  itemRef,
  classIDs,
  onSet,
  onClear,
  mode,
  fill,
  validity,
}: RelatedItemWidgetProps<M, S>) {

  const defaultClass: string | undefined = classIDs?.[0] ?? itemRef?.classID;

  const availableClassIDs: string[] | undefined =
    defaultClass === undefined && mode === 'id'
      ? [] // no way
      : mode === 'id'
          ? [defaultClass as string]
          : classIDs;

  // Cannot set if there are no class choices
  const canSet = onSet && (availableClassIDs === undefined || availableClassIDs.length > 0);

  const handleSet = React.useCallback(function handleSet(ref: InternalItemReference) {
    if (availableClassIDs === undefined || availableClassIDs.indexOf(ref.classID) >= 0) {
      onSet?.({ $set: (mode === 'generic' ? ref : ref.itemID) as S })
    } else {
      throw new Error(`Item with class ID ${ref.classID} cannot be assigned this relation`);
    }
  }, [availableClassIDs?.toString(), itemRef?.classID, onSet]);

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    // TODO: We want to show validity even if items are not being edited (read-only)
    // during review
    if (inputRef.current && (handleSet || onClear)) {
      inputRef.current.setCustomValidity(validity ?? '');
      if (validity) {
        inputRef.current.reportValidity();
      }
    }
  }, [validity, inputRef, handleSet || onClear]);

  return (
    <GenericRelatedItemView
      controlGroupProps={React.useMemo(
        (() => fill !== undefined ? { fill } : undefined),
        [fill])}
      inputRef={inputRef}
      itemRef={itemRef}

      // Memo these?
      availableClassIDs={availableClassIDs}

      onClear={onClear}
      onChange={canSet ? handleSet : undefined}
      itemSorter={COMMON_PROPERTIES.itemSorter}
    />
  );
}


interface ItemListProps<T> {
  items: Readonly<T[]>

  /** Singular item label, lowercase. */
  itemLabel: string

  /** Plural item label, lowercase. */
  itemLabelPlural?: string

  /** Same as for BP’s FormGroup. */
  helperText?: React.ReactNode

  /** Same as for BP’s FormGroup. */
  subLabel?: React.ReactNode

  /** When items are simple, ideally one property. */
  simpleItems?: boolean

  maxItems?: number
  minItems?: number

  /** The list is still ordered, but numbers won’t be shown. */
  hideOrdinals?: boolean

  /** Renders any given item. */
  itemRenderer: (
    /** Item data. */
    item: T,
    /** Item index in the list. */
    idx: number,
    handleChange: ((spec: Spec<T>) => void) | undefined,
    deleteButton: JSX.Element | undefined,
  ) => JSX.Element

  /** Required for being able to either remove, edit or create new items. */
  onChangeItems?: (spec: Spec<Readonly<T[]>>) => void

  /** Required for being able to create new items. */
  placeholderItem?: T | (() => T) | (() => Promise<T>)
}

/**
 * A wrapper for handling an ordered, optionally editable, list of items.
 * Not suitable for large or unbounded lists (it’s not windowed).
 */
export function ItemList<T> ({
  items,
  itemLabel,
  itemLabelPlural,
  helperText,
  subLabel,
  itemRenderer,
  onChangeItems,
  simpleItems,
  maxItems,
  minItems,
  placeholderItem,
  hideOrdinals,
}: ItemListProps<T>): JSX.Element {
  const itemViews = React.useMemo((() =>
    items.map((item, idx) =>
      <li key={idx}>
        {itemRenderer(
          item,
          idx,
          onChangeItems
            ? ((spec) => onChangeItems({ [idx]: spec }))
            : undefined,
          onChangeItems
            ? <Button
                outlined
                icon="remove"
                intent="danger"
                title={`Delete ${itemLabel} ${idx + 1}`}
                disabled={!onChangeItems}
                onClick={() => onChangeItems!({ $splice: [[ idx, 1 ]] })}
                text={simpleItems ? undefined : `Delete this ${itemLabel}`}
              />
            : undefined,
        )}
      </li>
    )
  ), [items.length, items.map(i => JSON.stringify(i)).toString(), itemRenderer, onChangeItems]);

  const pluralLabel = itemLabelPlural || `${itemLabel} items`;
  const countSummary = items.length > 0
    ? <>({items.length} total)</>
    : <>(no items to show)</>;

  const handleAddNew = React.useMemo(() => (
    placeholderItem !== undefined && onChangeItems
      ? async function handleAddNewItem() {
          const newItem: T = typeof placeholderItem === 'function'
            ? await (placeholderItem as (() => T) | (() => Promise<T>))()
            : placeholderItem;
          if (newItem !== undefined) {
            onChangeItems({ $push: [newItem] });
          }
        }
      : null
  ), [onChangeItems, placeholderItem]);

  const addButton = React.useMemo(() => (
    handleAddNew
      ? <Button
            outlined
            icon="add"
            intent="primary"
            onClick={handleAddNew}>
          Add {itemLabel}
        </Button>
      : null
  ), [handleAddNew, itemLabel]);

  const deleteAllButton = React.useMemo(() => (
    onChangeItems && items.length > 1
      ? <Button
            outlined
            icon="remove"
            intent="danger"
            onClick={() => onChangeItems({ $splice: [[0]] })}>
          Delete all {pluralLabel}
        </Button>
      : null
  ), [onChangeItems, pluralLabel, items.length > 1]);

  const countValidity = (maxItems !== undefined && items.length > maxItems)
    ? `Too many ${pluralLabel}: at most ${maxItems} is expected`
    : (minItems !== undefined && items.length < minItems)
      ? `Not enough ${pluralLabel}: at least ${minItems} is expected`
      : '';

  const Tag = hideOrdinals ? UL : OL;

  return (
    <PropertyDetailView
        label={pluralLabel}
        labelInfo={countSummary}
        intent={countValidity ? 'warning' : undefined}
        subLabel={subLabel}
        helperText={helperText || addButton || deleteAllButton || countValidity
          ? <>
              {helperText}
              {countValidity && onChangeItems
                ? <Callout intent="warning" css={css`margin-top: 10px;`}>{countValidity}</Callout>
                : null}
              {(addButton || deleteAllButton)
                ? <ButtonGroup css={css`margin-top: ${items.length > 0 ? '10px' : '0'};`}>
                    {addButton}
                    {deleteAllButton}
                  </ButtonGroup>
                : null}
            </>
          : null}>
      {items.length > 0
        ? <Tag css={css`margin-top: 0; padding-left: 1em;`}>
            {itemViews}
          </Tag>
        : null}
    </PropertyDetailView>
  );
}


const SimpleField: React.FC<{ val: string | undefined | null, label: string, onChange?: (newVal: string) => void }> =
function ({ val, label, onChange }) {
  return (
    <PropertyDetailView title={label} css={css`margin-bottom: 5px; label.bp4-label { font-weight: normal; }`}>
      <InputGroup
        title={val ?? `No ${label}`}
        readOnly={!onChange}
        value={val ?? ''}
        onChange={(evt: React.FormEvent<HTMLInputElement>) => onChange!(evt.currentTarget.value)}
      />
    </PropertyDetailView>
  );
};


export const InformationSourceEdit: React.FC<{
  citation: Citation
  onChange?: (newCitation: Citation) => void
}> = function ({ citation, onChange }) {
  function getChangeHandler
  <F extends keyof Omit<Citation, 'alternateTitles'>>
  (field: F, emptyValue?: '' | null | 'unset' | 'undefined'):
  undefined | ((val: Citation[F]) => void) {
    const empty = emptyValue === undefined
      ? ''
      : emptyValue === 'undefined'
        ? undefined
        : emptyValue;
    return onChange
      ? (val) => {
          let newCitation: Citation;
          if ((val as string)?.trim() === '') {
            if (empty === 'unset') {
              newCitation = update(citation, { $unset: [field] });
            } else {
              console.debug("Setting to empty", empty);
              newCitation = update(citation, { [field]: { $set: empty } });
            }
          } else {
            newCitation = update(citation, { [field]: { $set: val } });
          }
          return onChange!(newCitation);
        }
      : undefined;
  }
  const getOnChange = React.useCallback(getChangeHandler, [onChange, citation]);
  return (
    <>
      <SimpleField label="Author" val={citation.author} onChange={getOnChange('author', 'unset')} />
      <SimpleField label="Publisher" val={citation.publisher} onChange={getOnChange('publisher', 'unset')} />
      <SimpleField label="Publication Date" val={citation.publicationDate} onChange={getOnChange('publicationDate', 'unset')} />
      <SimpleField label="Revision Date" val={citation.revisionDate} onChange={getOnChange('revisionDate', 'unset')} />
      <SimpleField label="Title" val={citation.title} onChange={getOnChange('title')} />
      <SimpleField label="Name of series/journal/periodical" val={citation.seriesName ?? ''} onChange={getOnChange('seriesName', null)} />
      <SimpleField label="Series issue ID" val={citation.seriesIssueID ?? ''} onChange={getOnChange('seriesIssueID', null)} />
      <SimpleField label="Series page" val={citation.seriesPage ?? ''} onChange={getOnChange('seriesPage', null)} />
      <SimpleField label="Edition" val={citation.edition ?? ''} onChange={getOnChange('edition', null)} />
      <SimpleField label="Other details" val={citation.otherDetails ?? ''} onChange={getOnChange('otherDetails')} />
      <SimpleField label="ISBN" val={citation.isbn ?? ''} onChange={getOnChange('isbn', null)} />
      <SimpleField label="ISSN" val={citation.issn ?? ''} onChange={getOnChange('issn', null)} />
      <SimpleField label="URI" val={citation.uri ?? ''} onChange={getOnChange('uri', 'unset')} />
    </>
  );
};


export const ListItemView: ItemClassConfiguration<CommonGRItemData>["views"]["listItemView"] =
React.memo(function CommonListItemView (props) {
  return (
    <span className={props.className}>
      <span css={css`color: ${Colors.GRAY4}; font-family: monospace; font-size: 90%`}>
        {props.itemData.identifier}
      </span>
      &emsp;
      {props.itemData.name}
    </span>
  );
}, (
  (p1, p2) =>
    p1.className === p2.className &&
    p1.itemData.identifier === p2.itemData.identifier &&
    p1.itemData.name === p2.itemData.name
));


export interface NumericValueWithUoM {
  value: number
  /** UUID of respective UoM. */
  unitOfMeasurement: string
}

export interface StringValueWithUoM {
  value: string
  /** UUID of respective UoM. */
  unitOfMeasurement: string
}


export type Accuracy = StringValueWithUoM;


export const ACCURACY_STUB: Readonly<Accuracy> = {
  value: '',
  unitOfMeasurement: '',
} as const;


export const AccuracyEdit: React.FC<{
  accuracy: Accuracy
  onChange?: (newValue: Accuracy) => void
}> = function ({ accuracy, onChange }) {
  return <PropertyDetailView label="Accuracy">
    {/* NOTE: `fill`s are critical within this widget, to avoid weird clipping. */}
    <ControlGroup fill>
      <InputGroup
        readOnly={!onChange}
        onChange={(evt: React.FormEvent<HTMLInputElement>) =>
            onChange!((update(accuracy, { value: { $set: evt.currentTarget.value } } )))}
        value={accuracy.value}
      />
      <RelatedItem
        fill
        itemRef={accuracy.unitOfMeasurement
          ? { classID: 'unit-of-measurement', itemID: accuracy.unitOfMeasurement }
          : undefined
        }
        mode="id"
        onClear={onChange
          && (() => onChange(update(accuracy, { $unset: ['unitOfMeasurement'] } )))}
        onSet={onChange
          ? ((spec) => onChange(update(accuracy, { unitOfMeasurement: spec } )))
          : undefined}
        classIDs={['unit-of-measurement']}
      />
    </ControlGroup>
  </PropertyDetailView>
};
