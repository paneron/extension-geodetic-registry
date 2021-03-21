/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';
import { css, jsx } from '@emotion/core';
import update from 'immutability-helper';

import { ControlGroup, FormGroup, H3, InputGroup, NumericInput, UL } from '@blueprintjs/core';

import { Citation, ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import {
  CommonGRItemData,
  COMMON_PROPERTIES,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
  Extent,
  ExtentEdit,
  InformationSourceDetails,
  DEFAULT_EXTENT,
} from './common';
import { GenericRelatedItemView, PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';


interface TransformationParameter {
  parameter: string // Coordinate operation parameter UUID
  unitOfMeasurement: string | null // Unit of measurement UUID
  name: string // Dependent on type? filename?
  type: string
  value: string | number | null
  fileCitation: null | Citation
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
      const params = data.parameters ?? [];

      return (
        <CommonDetailView {...props}>

          {data.sourceCRS
            ? <PropertyDetailView title="Source CRS">
                <GenericRelatedItemView
                  itemRef={data.sourceCRS}
                  getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                  useRegisterItemData={props.useRegisterItemData}
                />
              </PropertyDetailView>
            : null}

          {data.targetCRS
            ? <PropertyDetailView title="Target CRS">
                <GenericRelatedItemView
                  itemRef={data.targetCRS}
                  getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                  useRegisterItemData={props.useRegisterItemData}
                />
              </PropertyDetailView>
            : null}

          <PropertyDetailView title="Extent">
            {extent
              ? <ExtentEdit extent={extent} />
              : '—'}
          </PropertyDetailView>

          <PropertyDetailView title="Operation version" inline>
            {data.operationVersion || '—'}
          </PropertyDetailView>

          <PropertyDetailView title="Accuracy">
            <ControlGroup>
              <NumericInput readOnly value={data.accuracy.value} />
              <GenericRelatedItemView
                itemRef={{ classID: 'unit-of-measurement', itemID: data.accuracy.unitOfMeasurement }}
                getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                useRegisterItemData={props.useRegisterItemData}
              />
            </ControlGroup>
          </PropertyDetailView>

          {params.length > 0
            ? <H3 css={css`margin-top: 1.5em;`}>Parameters</H3>
            : null}

          <UL css={css`padding-left: 0; list-style: square;`}>
            {params.map((param, idx) =>
              <li key={idx} css={css`margin-top: 1em;`}>
                <PropertyDetailView title={`Parameter ${idx + 1}`}>
                  <GenericRelatedItemView
                    itemRef={{ classID: 'coordinate-op-parameter', itemID: param.parameter }}
                    getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                    useRegisterItemData={props.useRegisterItemData}
                  />
                </PropertyDetailView>

                {/* <PropertyDetailView inline title="Name">{param.name}</PropertyDetailView> */}

                <PropertyDetailView title="Value" secondaryTitle={param.type}>
                  <ControlGroup>
                    <InputGroup disabled fill value={param.value?.toString() || '—'} />
                    {param.unitOfMeasurement
                      ? <GenericRelatedItemView
                          itemRef={{ classID: 'unit-of-measurement', itemID: param.unitOfMeasurement }}
                          getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                          useRegisterItemData={props.useRegisterItemData}
                        />
                      : null}
                  </ControlGroup>
                </PropertyDetailView>

                {param.fileCitation !== null
                  ? <PropertyDetailView title="Source">
                      <InformationSourceDetails
                        css={css`h6 { font-weight: normal; }`}
                        source={param.fileCitation} />
                    </PropertyDetailView>
                  : null}
              </li>
            )}
          </UL>

        </CommonDetailView>
      );
    },

    editView: (props) => <>

      <CommonEditView
          useRegisterItemData={props.useRegisterItemData}
          getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
          itemData={props.itemData}
          onChange={props.onChange ? (newData: CommonGRItemData) => {
            if (!props.onChange) { return; }
            props.onChange({ ...props.itemData, ...newData });
          } : undefined}>

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
          <ExtentEdit
            extent={props.itemData.extent ?? DEFAULT_EXTENT}
            onChange={props.onChange
              ? (extent) => props.onChange!(update(props.itemData, { extent: { $set: extent } }))
              : undefined}
          />
        </FormGroup>

      </CommonEditView>
    </>,
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
