/** @jsx jsx */

import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import update from 'immutability-helper';

import { ControlGroup, FormGroup, H5, InputGroup, NumericInput } from '@blueprintjs/core';

import { ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import {
  CommonGRItemData,
  COMMON_PROPERTIES,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
  Extent,
  ExtentDetail,
} from './common';


interface TransformationData extends CommonGRItemData {
  extent: Extent
  operationVersion: string

  sourceCRS?: { classID: string, itemID: string }
  targetCRS?: { classID: string, itemID: string }
  coordOperationMethod?: string
}


export const transformation: ItemClassConfiguration<TransformationData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Coordinate Operations — Transformation",
    description: "Transformation",
    id: 'coordinate-ops--transformation',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
    extent: { name: '', n: 0, e: 0, s: 0, w: 0 },
    operationVersion: '',
  },
  views: {
    listItemView: CommonListItemView as ItemListView<TransformationData>,

    detailView: (props) => {
      const data = props.itemData;
      const extent = data.extent;

      const GenericRelatedItemView = styled(props.GenericRelatedItemView)`
        margin-bottom: 1rem;
      `;

      return (
        <props.React.Fragment>

          <H5>Operation version</H5>
          <p>{data.operationVersion || '—'}</p>

          <H5>Extent</H5>
          <p>
            {extent
              ? <ExtentDetail extent={extent} />
              : '—'}
          </p>

          <H5>Source CRS</H5>
          {data.sourceCRS
            ? <GenericRelatedItemView
                React={props.React}
                itemRef={data.sourceCRS}
                getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                useRegisterItemData={props.useRegisterItemData}
              />
            : '—'}

          <H5>Target CRS</H5>
          {data.targetCRS
            ? <GenericRelatedItemView
                React={props.React}
                itemRef={data.targetCRS}
                getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                useRegisterItemData={props.useRegisterItemData}
              />
            : '—'}

          <CommonDetailView {...props} />

        </props.React.Fragment>
      );
    },

    editView: (props) => <props.React.Fragment>

      <CommonEditView
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        React={props.React}
        itemData={props.itemData}
        onChange={props.onChange ? (newData: CommonGRItemData) => {
          if (!props.onChange) { return; }
          props.onChange({ ...props.itemData, ...newData });
        } : undefined} />

      <FormGroup label="Operation version:">
        <InputGroup
          placeholder="E.g., GA v2"
          value={props.itemData.operationVersion || ''}
          disabled={!props.onChange}
          onChange={(evt: React.FormEvent<HTMLInputElement>) => {
            props.onChange
              ? props.onChange(update(props.itemData, { operationVersion: { $set: evt.currentTarget.value } }))
              : void 0;
          }}
        />
      </FormGroup>

      <FormGroup label="Source CRS:">
        <InputGroup
          value={props.itemData.operationVersion || ''}
          disabled={!props.onChange}
          onChange={(evt: React.FormEvent<HTMLInputElement>) => {
            props.onChange
              ? props.onChange(update(props.itemData, { operationVersion: { $set: evt.currentTarget.value } }))
              : void 0;
          }}
        />
      </FormGroup>

      <FormGroup label="Target CRS:">
        <InputGroup
          value={props.itemData.operationVersion || ''}
          disabled={!props.onChange}
          onChange={(evt: React.FormEvent<HTMLInputElement>) => {
            props.onChange
              ? props.onChange(update(props.itemData, { operationVersion: { $set: evt.currentTarget.value } }))
              : void 0;
          }}
        />
      </FormGroup>

      <FormGroup label="Extent:">
        <ControlGroup>
          <InputGroup
            placeholder="E.g., World"
            value={props.itemData.extent?.name || ''}
            disabled={!props.onChange}
            onChange={(evt: React.FormEvent<HTMLInputElement>) => {
              props.onChange
                ? props.onChange(update(props.itemData, { extent: { name: { $set: evt.currentTarget.value } } }))
                : void 0;
            }}
          />
          <NumericInput
            placeholder="N"
            value={props.itemData.extent?.n || 0}
            disabled={!props.onChange}
            onValueChange={(val) => {
              props.onChange
                ? props.onChange(update(props.itemData, { extent: { n: { $set: val } } }))
                : void 0;
            }}
          />
          <NumericInput
            placeholder="E"
            value={props.itemData.extent?.e || 0}
            onValueChange={(val) => {
              props.onChange
                ? props.onChange(update(props.itemData, { extent: { e: { $set: val } } }))
                : void 0;
            }}
          />
          <NumericInput
            placeholder="S"
            value={props.itemData.extent?.s || 0}
            disabled={!props.onChange}
            onValueChange={(val) => {
              props.onChange
                ? props.onChange(update(props.itemData, { extent: { s: { $set: val } } }))
                : void 0;
            }}
          />
          <NumericInput
            placeholder="W"
            value={props.itemData.extent?.w || 0}
            onValueChange={(val) => {
              props.onChange
                ? props.onChange(update(props.itemData, { extent: { w: { $set: val } } }))
                : void 0;
            }}
          />
        </ControlGroup>
      </FormGroup>
    </props.React.Fragment>,
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
