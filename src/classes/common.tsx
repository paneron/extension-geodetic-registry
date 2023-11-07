/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update, { type Spec } from 'immutability-helper';
import React, { type ReactChildren, type ReactNode, memo, useContext, useCallback, useMemo } from 'react';
import { jsx, css } from '@emotion/react';

import {
  Button,
  Classes,
  Colors, ControlGroup, FormGroup, H6, InputGroup,
  NumericInput, TextArea, UL, OL,
} from '@blueprintjs/core';


import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import type {
  Citation,
  ItemClassConfiguration,
  ItemDetailView,
  ItemEditView,
  InternalItemReference,
} from '@riboseinc/paneron-registry-kit/types';
import { incompleteItemRefToItemPathPrefix } from '@riboseinc/paneron-registry-kit/views/itemPathUtils';
import GenericRelatedItemView from '@riboseinc/paneron-registry-kit/views/GenericRelatedItemView';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';


// For backwards compatibility
import { type Extent, ExtentEdit, DEFAULT_EXTENT } from './extent';
export { type Extent, ExtentEdit, DEFAULT_EXTENT };


export interface CommonGRItemData {
  name: string
  identifier: number
  remarks: string
  informationSources: Readonly<Citation[]>
  aliases: Readonly<string[]>
}


export const DEFAULTS: CommonGRItemData = {
  name: '',
  identifier: 0,
  informationSources: [],
  remarks: '',
  aliases: [],
} as const;


function getInformationSourceStub(): Readonly<Citation> {
  return {
    title: '',
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


export const EditView: ItemEditView<CommonGRItemData> = function (props) {
  const { itemData, itemRef, onChange, children } = props;
  const { getMapReducedData, performOperation, operationKey } = useContext(DatasetContext);

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

  async function handleGetNewID() {
    if (onChange) {
      const { subregisterID, classID } = itemRef;
      const itemPath = incompleteItemRefToItemPathPrefix({ subregisterID, classID });
      const newIDResult = await getMapReducedData({
        chains: {
          maxID: {
            mapFunc: `
              if (key.startsWith("${itemPath}")) { emit(value?.data?.identifier ?? 0); }
            `,
            reduceFunc: `
              return (value > accumulator) ? (value + 1) : accumulator;
            `,
          },
        },
      });
      const newID: number = newIDResult.maxID;
      console.debug("Want to specify new ID", newID);
      onChange({ ...itemData, identifier: newID });
    } else {
      throw new Error("Dataset is read-only");
    }
  }

  return (
    <SplitView
        aside={<>

          <AliasesEdit
            aliases={itemData.aliases}
            onChange={onChange
              ? (newAliases) => onChange!(update(itemData, { aliases: { $set: newAliases } } ))
              : undefined}
          />

          <PropertyDetailView title="Remarks">
            <TextArea fill required value={itemData.remarks ?? ''} {...textInputProps('remarks')} />
          </PropertyDetailView>

          <ItemList
            items={itemData.informationSources}
            itemLabel="citation (information source)"
            itemLabelPlural="citations"
            placeholderItem={getInformationSourceStub()}
            onChangeItems={onChange
              ? (spec) => onChange!(update(itemData, { informationSources: spec }))
              : undefined}
            itemRenderer={function renderCitation (item, idx, handleChange, deleteButton) {
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
        </>}>

      <FormGroup label="GR identifier:">
        <ControlGroup>
          <NumericInput
            required
            value={itemData.identifier}
            buttonPosition={!onChange ? 'none' : undefined}
            readOnly={!onChange}
            min={0}
            max={Infinity}
            onValueChange={onChange
              ? (val) => (onChange ? onChange({ ...itemData, identifier: val }) : void 0)
              : undefined}
          />
          {onChange
            ? <Button
                icon='reset'
                outlined
                title="Suggest latest ID"
                disabled={operationKey !== undefined}
                onClick={performOperation('obtaining new ID', handleGetNewID)}
              />
            : null}
        </ControlGroup>
      </FormGroup>

      <FormGroup label="Name:">
        <InputGroup required value={itemData.name} {...textInputProps('name')} />
      </FormGroup>

      {children}

    </SplitView>
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

  const handleSet = useCallback(function handleSet(ref: InternalItemReference) {
    if (availableClassIDs === undefined || availableClassIDs.indexOf(ref.classID) >= 0) {
      onSet?.({ $set: (mode === 'generic' ? ref : ref.itemID) as S })
    } else {
      throw new Error(`Item with class ID ${ref.classID} cannot be assigned this relation`);
    }
  }, [availableClassIDs?.toString(), itemRef?.classID, onSet]);

  return (
    <GenericRelatedItemView
      itemRef={itemRef}
      availableClassIDs={availableClassIDs}
      onClear={onClear}
      onChange={canSet ? handleSet : undefined}
      itemSorter={COMMON_PROPERTIES.itemSorter}
    />
  );
}


interface ItemListProps<T> {
  items: Readonly<T[]>
  itemLabel: string
  itemLabelPlural?: string

  /** Same as for BP’s FormGroup. */
  helperText?: React.ReactNode

  /** Same as for BP’s FormGroup. */
  subLabel?: React.ReactNode

  /** When items are simple, ideally one property. */
  simpleItems?: boolean

  itemRenderer: (
    item: T,
    idx: number,
    handleChange: ((spec: Spec<T>) => void) | undefined,
    deleteButton: JSX.Element | undefined,
  ) => JSX.Element

  /** Required for being able to either remove, edit or create new items. */
  onChangeItems?: (spec: Spec<Readonly<T[]>>) => void

  /** Required for being able to create new items. */
  placeholderItem?: T
}

/** A wrapper for handling editable lists of items. */
export function ItemList<T> ({
  items,
  itemLabel,
  itemLabelPlural,
  helperText,
  subLabel,
  itemRenderer,
  onChangeItems,
  simpleItems,
  placeholderItem,
}: ItemListProps<T>): JSX.Element {
  const itemViews = useMemo((() =>
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
    : <>(no items to show)</>

  const addButton = useMemo(() => (
    onChangeItems !== undefined && placeholderItem !== undefined
      ? <Button
            outlined
            icon="add"
            intent="primary"
            onClick={() => onChangeItems({ $push: [placeholderItem] })}>
          Add {itemLabel}
        </Button>
      : null
  ), [onChangeItems, itemLabel, placeholderItem]);

  return (
    <PropertyDetailView
        label={pluralLabel}
        labelInfo={countSummary}
        css={css`margin-top: 10px;`}
        subLabel={subLabel}
        helperText={helperText || addButton
          ? <>
              {subLabel}
              {(subLabel && addButton)
                ? <br />
                : null}
              {addButton}
            </>
          : null}>
      {items.length > 0
        ? <OL css={css`margin-top: 0; padding-left: 1em;`}>
            {itemViews}
          </OL>
        : null}
    </PropertyDetailView>
  );
}


const SimpleField: React.FC<{ val: string, label: string, onChange?: (newVal: string) => void }> =
function ({ val, label, onChange }) {
  return (
    <PropertyDetailView title={label} css={css`margin-bottom: 5px; label.bp4-label { font-weight: normal; }`}>
      <InputGroup
        title={val}
        readOnly={!onChange}
        value={val}
        onChange={(evt: React.FormEvent<HTMLInputElement>) => onChange!(evt.currentTarget.value)}
      />
    </PropertyDetailView>
  );
};


const InformationSourceEdit: React.FC<{ citation: Citation, onChange?: (newCitation: Citation) => void }> =
function ({ citation, onChange }) {
  return (
    <>
      <SimpleField label="Title" val={citation.title} onChange={onChange ? (title) => onChange!({ ...citation, title }) : undefined} />
      <SimpleField label="Series issue ID" val={citation.seriesIssueID ?? ''} onChange={onChange ? (seriesIssueID) => onChange!({ ...citation, seriesIssueID }) : undefined} />
      <SimpleField label="Series name" val={citation.seriesName ?? ''} onChange={onChange ? (seriesName) => onChange!({ ...citation, seriesName }) : undefined} />
      <SimpleField label="Series page" val={citation.seriesPage ?? ''} onChange={onChange ? (seriesPage) => onChange!({ ...citation, seriesPage }) : undefined} />
      <SimpleField label="Edition" val={citation.edition ?? ''} onChange={onChange ? (edition) => onChange!({ ...citation, edition }) : undefined} />
      <SimpleField label="Other details" val={citation.otherDetails ?? ''} onChange={onChange ? (otherDetails) => onChange!({ ...citation, otherDetails }) : undefined} />
      <SimpleField label="ISBN" val={citation.isbn ?? ''} onChange={onChange ? (isbn) => onChange!({ ...citation, isbn }) : undefined} />
      <SimpleField label="ISSN" val={citation.issn ?? ''} onChange={onChange ? (issn) => onChange!({ ...citation, issn }) : undefined} />
    </>
  );
};


export const ListItemView: ItemClassConfiguration<CommonGRItemData>["views"]["listItemView"] =
memo(function CommonListItemView (props) {
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


const DLEntry: React.FC<{ t: string, d: string }> = function ({ t, d }) {
  return <>
    <dt>{t}</dt>
    <dd>{d}</dd>
  </>
};


export const InformationSourceDetails: React.FC<{
  source: Citation
  className?: string
}> = function ({ source, className }) {

  let editionDate: string;
  try {
    editionDate = source.editionDate?.toLocaleDateString() ?? '';
  } catch (e) {
    editionDate = '';
  }


  return (
    <article className={className}>

      <H6 style={{ margin: '.5em 0 0 0' }}>{source.title}</H6>

      {source.otherDetails
        ? <p style={{ margin: '.5em 0 0 0' }}>Citation details: {source.otherDetails}</p>
        : null}

      <dl css={css`
          display: flex; flex-flow: row wrap;
          margin: 0;
          font-size: 85%;

          &:not(:empty) {
            border-bottom-width: .25em;
            border-bottom-style: solid;
            padding-bottom: .25em;
          }
          dt, dd {
            margin: .25em 0 0 0;
            border-top-width: .25em;
            border-top-style: dotted;
          }
          &:not(:empty), dt, dd {
            border-color: ${Colors.LIGHT_GRAY3};
            .bp4-dark & {
              border-color: ${Colors.DARK_GRAY1};
            }
          }
          dt {
            flex-basis: 30%;
          }
          dd {
            font-style: italic;
            flex-basis: 70%;
            padding-right: 1em;
          }
        `}>
        {source.edition ? <DLEntry t="Edition" d={source.edition} /> : null}
        {source.editionDate ? <DLEntry t="Edition date" d={editionDate} /> : null}

        {source.seriesName ? <DLEntry t="Series name" d={source.seriesName} /> : null}
        {source.seriesIssueID ? <DLEntry t="Issue" d={source.seriesIssueID} /> : null}
        {source.seriesPage ? <DLEntry t="Page(s)" d={source.seriesPage} /> : null}

        {source.issn ? <DLEntry t="ISSN" d={source.issn} /> : null}
        {source.isbn ? <DLEntry t="ISBN" d={source.isbn} /> : null}
      </dl>

    </article>
  );
};


export const DetailView: ItemDetailView<CommonGRItemData> = (props) => {
  const data = props.itemData;

  return (
    <SplitView
        className={props.className}
        aside={<>

          <AliasesEdit aliases={data.aliases} />

          {data.remarks
            ? <PropertyDetailView title="Remarks">
                <p>{data.remarks}</p>
              </PropertyDetailView>
            : null}

          {(data.informationSources || []).length > 0
            ? <PropertyDetailView title="Information sources">
                <UL css={css`padding-left: 0; list-style: square;`}>
                  {data.informationSources.map((s, idx) =>
                    <li key={idx}>
                      <InformationSourceDetails source={s} />
                    </li>)}
                </UL>
              </PropertyDetailView>
            : null}

        </>}>
      {props.children}
    </SplitView>
  )
};


const SplitView: React.FC<{
  aside?: ReactChildren | ReactNode
  className?: string
}> = memo(function ({ children, aside, className }) {
  return (
    <div css={css`
        position: absolute; inset: 0;

        display: flex; flex-flow: row nowrap; overflow: hidden;

        @media (max-width: 1000px) {
          flex-flow: column nowrap;
        }

        & > * { padding: 1rem; }`} className={className}>

      <div css={css`
        overflow-y: auto; flex: 1;
        background: ${Colors.LIGHT_GRAY5};
        .bp4-dark & {
          background: ${Colors.DARK_GRAY3};
        }
      `}>
        {children}
      </div>

      <aside
        className={Classes.ELEVATION_1}
        css={css`
          overflow-y: auto;
          flex-basis: 45%;
          background: ${Colors.LIGHT_GRAY4};
          .bp4-dark & {
            background: ${Colors.DARK_GRAY4};
          }
      `}>
        {aside}
      </aside>
    </div>
  );
});
