/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';
import React, { ReactChildren, ReactNode, useContext } from 'react';
import { jsx, css } from '@emotion/react';

import {
  Button,
  Classes,
  Colors, ControlGroup, FormGroup, H4, H6, InputGroup,
  NumericInput, TextArea, UL,
} from '@blueprintjs/core';


import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import type {
  Citation, ItemClassConfiguration,
  ItemDetailView,
  ItemEditView,
} from '@riboseinc/paneron-registry-kit/types';
import { incompleteItemRefToItemPathPrefix } from '@riboseinc/paneron-registry-kit/views/itemPathUtils';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';


// For backwards compatibility
import { Extent, ExtentEdit, DEFAULT_EXTENT } from './extent';
export { Extent, ExtentEdit, DEFAULT_EXTENT };


export interface CommonGRItemData {
  name: string
  identifier: number
  remarks: string
  informationSources: Citation[]
  aliases: string[]
}


export const DEFAULTS: CommonGRItemData = {
  name: '',
  identifier: 0,
  informationSources: [],
  remarks: '',
  aliases: [],
};


function getInformationSourceStub(): Citation {
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
  };
}


export const AliasesDetail: React.FC<{ aliases: string[] }> = function ({ aliases }) {
  return <PropertyDetailView title="Aliases">
    <UL>
      {aliases.map((a, idx) => <li key={idx}>{a}</li>)}
    </UL>
  </PropertyDetailView>;
};

export const AliasesEdit: ItemEditView<CommonGRItemData> = function (props) {
  return (
    <PropertyDetailView title="Aliases">
      <ControlGroup vertical>
        {(props.itemData.aliases || []) .map((alias, idx) =>
          <InputGroup
            key={idx}
            fill
            required
            value={alias}
            readOnly={!props.onChange}
            rightElement={props.onChange
              ? <Button
                  icon='cross'
                  onClick={() => props.onChange!(update(
                    props.itemData,
                    { aliases: { $splice: [[ idx, 1 ]] } }
                  ))}
                />
              : undefined}
            onChange={evt => props.onChange!(update(
              props.itemData,
              { aliases: { [idx]: { $set: evt.currentTarget.value } } },
            ))}
          />
        )}
        {props.onChange
          ? <Button icon='add' onClick={() => props.onChange!(update(
              props.itemData,
              { aliases: { $push: [''] } },
            ))}>
              Add alias
            </Button>
          : undefined}
      </ControlGroup>
    </PropertyDetailView>
  );
};


export const COMMON_PROPERTIES: Pick<ItemClassConfiguration<CommonGRItemData>, 'itemSorter'> = {
  itemSorter: (a, b) => a.identifier - b.identifier,
};


export const EditView: ItemEditView<CommonGRItemData> = function (props) {
  const { itemData, itemRef, onChange, children } = props;
  const { getMapReducedData, performOperation, operationKey } = useContext(DatasetContext);

  function textInputProps
  <F extends keyof Omit<CommonGRItemData, 'informationSource'>>
  (fieldName: F) {
    return {
      disabled: !onChange,
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

          <AliasesEdit {...props}/>
          <FormGroup label="Remarks:">
            <TextArea fill required value={itemData.remarks} {...textInputProps('remarks')} />
          </FormGroup>

          {itemData.informationSources.length > 0
            ? <H4 css={css`margin-top: 1.5em;`}>
                Information sources
              </H4>
            : null}

          <UL css={css`padding-left: 0; list-style: square;`}>
            {itemData.informationSources.map((infoSource, idx) =>
              <li key={idx} css={css`margin-top: 1em;`}>
                <FormGroup
                    label={`Source ${idx + 1}:`}
                    labelInfo={<Button
                        small
                        disabled={!onChange}
                        onClick={() => onChange!(update(itemData, { informationSources: { $splice: [[ idx, 1 ]] } }))}>
                      Delete
                    </Button>}>
                  <InformationSourceEdit
                    citation={infoSource}
                    onChange={onChange
                      ? (infoSource) => onChange!(update(itemData, { informationSources: { [idx]: { $set: infoSource } } }))
                      : undefined}
                  />
                </FormGroup>
              </li>
            )}
          </UL>

          <Button
              outlined
              disabled={!onChange}
              onClick={() => onChange!(update(itemData, { informationSources: { $push: [getInformationSourceStub()] } }))}
              icon="add">
            Append source
          </Button>

        </>}>

      <FormGroup label="GR identifier:">
        <ControlGroup>
          <NumericInput
            required
            value={itemData.identifier}
            disabled={!onChange}
            min={0}
            max={Infinity}
            onValueChange={onChange
              ? (val) => (onChange ? onChange({ ...itemData, identifier: val }) : void 0)
              : undefined}
          />
          {onChange
            ? <Button
                icon='reset'
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


const SimpleField: React.FC<{ val: string, label: string, onChange?: (newVal: string) => void }> =
function ({ val, label, onChange }) {
  return (
    <FormGroup label={`${label}:`}>
      <InputGroup
        readOnly={!onChange}
        value={val}
        onChange={(evt: React.FormEvent<HTMLInputElement>) => onChange!(evt.currentTarget.value)}
      />
    </FormGroup>
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
(props) => (
  <span className={props.className}>
    <span css={css`color: ${Colors.GRAY4}; font-family: monospace; font-size: 90%`}>
      {props.itemData.identifier}
    </span>
    &emsp;
    {props.itemData.name}
  </span>
);



export const InformationSourceDetails: React.FC<{
  source: Citation
  className?: string
}> = function ({ source, className }) {

  const DLEntry: React.FC<{ t: string, d: string }> = function ({ t, d }) {
    return <>
      <dt>{t}</dt>
      <dd>{d}</dd>
    </>
  }

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
}> = function ({ children, aside, className }) {
  return (
    <div css={css`
        position: absolute; top: 0rem; left: 0rem; right: 0rem; bottom: 0rem;

        display: flex; flex-flow: row nowrap; overflow: hidden;

        @media (max-width: 1000px) {
          flex-flow: column nowrap;
        }

        & > * { padding: 1rem; }`} className={className}>

      <div css={css`overflow-y: auto; flex: 1;`}>
        {children}
      </div>

      <aside
          css={css`
            overflow-y: auto;
            flex-basis: 45%;
            background: ${Colors.LIGHT_GRAY4};
            .bp4-dark & {
              background: ${Colors.DARK_GRAY4};
            }
          `}
          className={Classes.ELEVATION_1}>
        {aside}
      </aside>
    </div>
  );
}
