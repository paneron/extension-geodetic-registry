/** @jsx jsx */

import { css, jsx } from '@emotion/core';
import update from 'immutability-helper';

import { ControlGroup, FormGroup, InputGroup, NumericInput, UL } from '@blueprintjs/core';

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
import { GenericRelatedItemView, PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';


interface TransformationParameter {
  parameter: string // Coordinate operation parameter UUID
  unitOfMeasurement: string | null // Unit of measurement UUID
  name: string // Dependent on type? filename?
  type: string
  value: string | number | null
  fileCitation: null
}


interface TransformationData extends CommonGRItemData {
  extent: Extent
  operationVersion: string
  accuracy: {
    value: number
    unitOfMeasurement: string // Unit of measurement UUID
  }
  parameters: TransformationParameter[]

  sourceCRS?: { classID: string, itemID: string }
  targetCRS?: { classID: string, itemID: string }
  coordOperationMethod?: string
}


export const transformation: ItemClassConfiguration<TransformationData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Transformation",
    description: "Coordinate Operations — Transformation",
    id: 'coordinate-ops--transformation',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
    extent: { name: '', n: 0, e: 0, s: 0, w: 0 },
    operationVersion: '',
    parameters: [],
  },
  views: {
    listItemView: CommonListItemView as ItemListView<TransformationData>,

    detailView: (props) => {
      const data = props.itemData;
      const extent = data.extent;
      const params = data.parameters || [];

      return (
        <CommonDetailView {...props}>

          {data.sourceCRS
            ? <PropertyDetailView title="Source CRS">
                <GenericRelatedItemView
                  React={props.React}
                  itemRef={data.sourceCRS}
                  getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                  useRegisterItemData={props.useRegisterItemData}
                />
              </PropertyDetailView>
            : '—'}

          {data.targetCRS
            ? <PropertyDetailView title="Target CRS">
                <GenericRelatedItemView
                  React={props.React}
                  itemRef={data.targetCRS}
                  getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                  useRegisterItemData={props.useRegisterItemData}
                />
              </PropertyDetailView>
            : '—'}

          <PropertyDetailView title="Extent">
            {extent
              ? <ExtentDetail extent={extent} />
              : '—'}
          </PropertyDetailView>

          <PropertyDetailView title="Operation version" inline>
            {data.operationVersion || '—'}
          </PropertyDetailView>

          <PropertyDetailView title="Accuracy">
            <ControlGroup>
              <NumericInput readOnly value={data.accuracy.value} />
              <GenericRelatedItemView
                React={props.React}
                itemRef={{ classID: 'unit-of-measurement', itemID: data.accuracy.unitOfMeasurement }}
                getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                useRegisterItemData={props.useRegisterItemData}
              />
            </ControlGroup>
          </PropertyDetailView>

          <UL css={css`padding-left: 0; list-style: square;`}>
            {params.map((param, idx) =>
              <li key={idx}>
                <PropertyDetailView title={`Parameter ${idx + 1} — ${param.type}`}>
                  <GenericRelatedItemView
                    React={props.React}
                    itemRef={{ classID: 'coordinate-op-parameter', itemID: param.parameter }}
                    getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                    useRegisterItemData={props.useRegisterItemData}
                  />
                </PropertyDetailView>

                {/* <PropertyDetailView inline title="Name">{param.name}</PropertyDetailView> */}

                <PropertyDetailView title="Value">
                  <ControlGroup>
                    <InputGroup disabled fill value={param.value?.toString() || '—'} />
                    {param.unitOfMeasurement
                      ? <GenericRelatedItemView
                          React={props.React}
                          itemRef={{ classID: 'unit-of-measurement', itemID: param.unitOfMeasurement }}
                          getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                          useRegisterItemData={props.useRegisterItemData}
                        />
                      : null}
                  </ControlGroup>
                </PropertyDetailView>
              </li>
            )}
          </UL>

        </CommonDetailView>
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
