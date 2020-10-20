/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';
import { jsx, css } from '@emotion/core';

import { Colors, FormGroup, H5,  H6,  InputGroup, NumericInput, Tag, TextArea, UL } from '@blueprintjs/core';
import { Citation, ItemClassConfiguration, ItemDetailView, ItemEditView } from '@riboseinc/paneron-registry-kit/types';
import { PluginFC } from '@riboseinc/paneron-extension-kit/types';


export interface CommonGRItemData {
  name: string
  identifier: number
  description: string
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
      {extent.name}:
      &emsp;
      N={extent.n}
      &ensp;
      E={extent.e}
      &ensp;
      S={extent.s}
      &ensp;
      W={extent.w}
    </>
  );
};


export const PropertyDetail: React.FC<{ title: string }> = function ({ title, children }) {
  return <div css={css`margin-bottom: 1em`}>
    <H5>{title}</H5>
    {children}
  </div>;
};


export const AliasesDetail: React.FC<{ aliases: string[] }> = function ({ aliases }) {
  return <PropertyDetail title="Aliases">
    <UL>
      {aliases.map((a, idx) => <li key={idx}>{a}</li>)}
    </UL>
  </PropertyDetail>;
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
      <NumericInput required value={itemData.identifier} disabled={!onChange} onValueChange={onChange
        ? (val) => (onChange ? onChange({ ...itemData, identifier: val }) : void 0)
        : undefined} />
    </FormGroup>

    <FormGroup label="Name:">
      <InputGroup required value={itemData.name} {...textInputProps('name')} />
    </FormGroup>

    <FormGroup label="Description:">
      <TextArea fill required value={itemData.description} {...textInputProps('description')} />
    </FormGroup>

    <FormGroup label="Remarks:">
      <TextArea fill required value={itemData.remarks} {...textInputProps('remarks')} />
    </FormGroup>

  </React.Fragment>;
};


export const ListItemView: ItemClassConfiguration<CommonGRItemData>["views"]["listItemView"] =
(props) => (
  <span className={props.className} css={css`overflow: hidden; text-overflow: ellipsis`}>
    <Tag minimal>{props.itemData.identifier}</Tag>
    &emsp;
    {props.itemData.name}
  </span>
);



const InformationSourceDetails: PluginFC<{ source: Citation }> = function ({ React, source }) {
  const DLEntry: React.FC<{ t: string, d: string }> = function ({ t, d }) {
    return <React.Fragment>
      <dt>{t}</dt>
      <dd>{d}</dd>
    </React.Fragment>
  }

  return (
    <article>

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
        {source.seriesIssueID ? <DLEntry t="Series issue ID" d={source.seriesIssueID} /> : null}
        {source.seriesPage ? <DLEntry t="Series page" d={source.seriesPage} /> : null}

        {source.issn ? <DLEntry t="ISSN" d={source.issn} /> : null}
        {source.isbn ? <DLEntry t="ISBN" d={source.isbn} /> : null}
      </dl>

    </article>
  );
};


export const DetailView: ItemDetailView<CommonGRItemData> = (props) => {
  const data = props.itemData;

  return (
    <props.React.Fragment>

      {data.description
        ? <props.React.Fragment>
            <H5>Description</H5>
            <p>{data.description}</p>
          </props.React.Fragment>
        : null}

      {data.remarks
        ? <props.React.Fragment>
            <H5>Remarks</H5>
            <p>{data.remarks}</p>
          </props.React.Fragment>
        : null}

      {(data.informationSources || []).length > 0
        ? <props.React.Fragment>
            <H5>Information sources</H5>
            <UL>
              {data.informationSources.map((s, idx) =>
                <li key={idx}>
                  <InformationSourceDetails React={props.React} source={s} />
                </li>)}
            </UL>
          </props.React.Fragment>
        : null}

    </props.React.Fragment>
  );
};
