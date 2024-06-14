/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';
import React from 'react';
import { jsx, css } from '@emotion/react';

import {
  ControlGroup,
  InputGroup,
  NumericInput,
  TextArea,
} from '@blueprintjs/core';

import type {
  Citation,
  ItemClassConfiguration,
  ItemEditViewProps,
  InternalItemReference,
} from '@riboseinc/paneron-registry-kit/types';
import { GenericRelatedItemView, PropertyDetailView } from '@riboseinc/paneron-registry-kit';

import ItemList from '../helpers/ItemList';
export { ItemList };

import ItemTable from '../helpers/ItemTable';
import { type ColumnInfo } from '../helpers/ItemTable';
export { ItemTable, type ColumnInfo };


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
    title: "Untitled source",
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
  hideInfoSources?: boolean,
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
              ? "Unique across all item classes in this register. For not-yet-accepted items, must not be left zero."
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
        : <PropertyDetailView title="Remarks">
            <TextArea fill required value={itemData.remarks ?? ''} {...textInputProps('remarks')} />
          </PropertyDetailView>}

      {children}

      {props.hideAliases
        ? null
        : <ItemList
            items={itemData.informationSources}
            itemLabel="information source"
            itemLabelPlural="information sources"
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
          />}

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

  className?: string
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
  className,
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

      hideItemClassTitle={mode === 'id'}

      // Memo these?
      availableClassIDs={availableClassIDs}

      onClear={onClear}
      onChange={canSet ? handleSet : undefined}
      itemSorter={COMMON_PROPERTIES.itemSorter}

      className={className}
    />
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
              //console.debug("Setting to empty", empty);
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
      <span css={css`font-family: monospace; font-size: 90%`}>
        {props.itemData.identifier === 0
          ? 'NEW'
          : props.itemData.identifier}
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
