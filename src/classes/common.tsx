/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';
import { jsx, css } from '@emotion/core';

import {
  Classes,
  Colors, ControlGroup, FormGroup, H6, InputGroup,
  NumericInput, Tag, TextArea, UL,
} from '@blueprintjs/core';
import {
  Citation, ItemClassConfiguration,
  ItemDetailView, ItemEditView
} from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import { PluginFC } from '@riboseinc/paneron-extension-kit/types';


export interface CommonGRItemData {
  name: string
  identifier: number
  description: string | null
  remarks: string
  informationSources: Citation[]
}


export const DEFAULTS: CommonGRItemData = {
  name: '',
  identifier: 0,
  informationSources: [],
  remarks: '',
  description: '',
};


export interface Extent {
  n: number
  e: number
  s: number
  w: number
  name: string
}
export const DEFAULT_EXTENT: Extent = { name: '', n: 0, e: 0, s: 0, w: 0 };
export const ExtentDetail: React.FC<{ extent: Extent }> = function ({ extent }) {
  return (
    <>
      <ControlGroup fill>
        <InputGroup readOnly leftIcon={<Tag minimal>N Lat</Tag>} value={extent.n.toLocaleString()} />
        <InputGroup readOnly leftIcon={<Tag minimal>E Lon</Tag>} value={extent.e.toLocaleString()} />
        <InputGroup readOnly leftIcon={<Tag minimal>S Lat</Tag>} value={extent.s.toLocaleString()} />
        <InputGroup readOnly leftIcon={<Tag minimal>W Lon</Tag>} value={extent.w.toLocaleString()} />
      </ControlGroup>
      <p css={css`margin-top: .5em; font-size: 90%;`}>
        {extent.name}
      </p>
    </>
  );
};


export const AliasesDetail: React.FC<{ aliases: string[] }> = function ({ aliases }) {
  return <PropertyDetailView title="Aliases">
    <UL>
      {aliases.map((a, idx) => <li key={idx}>{a}</li>)}
    </UL>
  </PropertyDetailView>;
};


export const COMMON_PROPERTIES: Pick<ItemClassConfiguration<CommonGRItemData>, 'itemSorter'> = {
  itemSorter: (a, b) => a.identifier - b.identifier,
};


export const EditView: ItemEditView<CommonGRItemData> = function ({ React, itemData, onChange }) {
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

  return <React.Fragment>

    <FormGroup label="GR identifier:">
      <NumericInput
        required
        value={itemData.identifier}
        disabled={!onChange}
        onValueChange={onChange
          ? (val) => (onChange ? onChange({ ...itemData, identifier: val }) : void 0)
          : undefined}
       />
    </FormGroup>

    <FormGroup label="Name:">
      <InputGroup required value={itemData.name} {...textInputProps('name')} />
    </FormGroup>

    <FormGroup label="Description:">
      <TextArea fill required value={itemData.description || ''} {...textInputProps('description')} />
    </FormGroup>

    <FormGroup label="Remarks:">
      <TextArea fill required value={itemData.remarks} {...textInputProps('remarks')} />
    </FormGroup>

  </React.Fragment>;
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



export const InformationSourceDetails: PluginFC<{
  source: Citation
  className?: string
}> = function ({ React, source, className }) {

  const DLEntry: React.FC<{ t: string, d: string }> = function ({ t, d }) {
    return <React.Fragment>
      <dt>{t}</dt>
      <dd>{d}</dd>
    </React.Fragment>
  }

  return (
    <article className={className}>

      <H6 style={{ margin: '.5em 0 0 0' }}>{source.title}</H6>

      {source.otherDetails ? <p style={{ margin: '.5em 0 0 0' }}>Citation details: {source.otherDetails}</p> : null}

      <dl css={css`
          display: flex; flex-flow: row wrap;
          margin: 0;
          font-size: 85%;

          &:not(:empty) {
            border-bottom: .25em ${Colors.LIGHT_GRAY3} solid;
          }
          dt, dd {
            margin: .25em 0 0 0;
            border-top: .25em ${Colors.LIGHT_GRAY3} dotted;
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
        {source.editionDate ? <DLEntry t="Edition" d={source.editionDate?.toLocaleDateString()} /> : null}

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
    <div css={css`
        position: absolute; top: 0rem; left: 0rem; right: 0rem; bottom: 0rem;

        display: flex; flex-flow: row nowrap; overflow: hidden;

        @media (max-width: 1000px) {
          flex-flow: column nowrap;
        }

        & > * { padding: 1rem; }`}>

      <div css={css`overflow-y: auto; flex: 1;`}>
        {props.children}
      </div>

      <aside
          css={css`
            overflow-y: auto;
            flex-basis: 45%; background: ${Colors.LIGHT_GRAY4};
          `}
          className={Classes.ELEVATION_1}>
        {data.description
          ? <PropertyDetailView title="Description">
              <p>{data.description}</p>
            </PropertyDetailView>
          : null}

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
                    <InformationSourceDetails React={props.React} source={s} />
                  </li>)}
              </UL>
            </PropertyDetailView>
          : null}
      </aside>

    </div>
  );
};
