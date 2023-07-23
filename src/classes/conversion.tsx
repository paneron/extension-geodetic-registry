/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';

import React from 'react';
import { Button, ControlGroup, FormGroup, H3, InputGroup, NumericInput, UL } from '@blueprintjs/core';
import { css, jsx } from '@emotion/react';
import { type ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import GenericRelatedItemView from '@riboseinc/paneron-registry-kit/views/GenericRelatedItemView';

import {
  CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
  COMMON_PROPERTIES,
  AliasesDetail,
  Extent,
  ExtentEdit,
  DEFAULT_EXTENT,
} from './common';

interface ConversionParameter {
  parameter: string // Coordinate operation parameter UUID
  unitOfMeasurement: string | null // Unit of measurement UUID
  name: string // Dependent on type? filename?
  value: string | number | null
}


function getParameterStub(): ConversionParameter {
  return {
    parameter: '',
    unitOfMeasurement: null,
    name: '',
    value: null,
  };
}

export interface ConversionData extends CommonGRItemData {
  aliases: string[]
  extent: Extent
  accuracy: {
    value: number
    unitOfMeasurement: string // Unit of measurement UUID
  }
  // epsg:<id>
  parameters: ConversionParameter[]
  coordinateOperationMethod?: string
  scope: string
}

export const DEFAULTS: ConversionData = {
  ...SHARED_DEFAULTS,
  accuracy: {
    value: 0,
    unitOfMeasurement: '',
  },
  parameters: [],
  aliases: [],
  extent: DEFAULT_EXTENT,
  scope: '',
  coordinateOperationMethod: ''
};


export const conversion: ItemClassConfiguration<ConversionData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Conversion",
    description: "Coordinate Operations — Conversion",
    id: 'coordinate-ops--conversion',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<ConversionData>,
    detailView: (props) => {
      const data = props.itemData;
      const extent = data.extent;
      const params = data.parameters ?? [];

      return (
        <CommonDetailView {...props}>

          {(data.aliases || []).length > 0
            ? <AliasesDetail aliases={data.aliases} />
            : null}

          <PropertyDetailView title="Extent">
            {extent
              ? <ExtentEdit extent={extent} />
              : '—'}
          </PropertyDetailView>

          <PropertyDetailView title="Accuracy">
            <ControlGroup vertical>
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

                <PropertyDetailView title="Value">
                  <ControlGroup vertical>
                    <InputGroup disabled fill css={css`margin-bottom: .5rem;`} value={param.value?.toString() || '—'} />
                    {param.unitOfMeasurement
                      ? <GenericRelatedItemView
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
      )
    },
    editView: (props) => (
      <CommonEditView
        useRegisterItemData={props.useRegisterItemData}
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        itemData={props.itemData}
        itemRef={props.itemRef}
        onChange={props.onChange ? (newData: CommonGRItemData) => {
          if (!props.onChange) { return; }
          props.onChange({ ...props.itemData, ...newData });
        } : undefined}>

        <FormGroup label="Extent:">
          <ExtentEdit
            extent={props.itemData.extent ?? DEFAULT_EXTENT}
            onChange={props.onChange
              ? (extent) => props.onChange!(update(props.itemData, { extent: { $set: extent } }))
              : undefined}
          />
        </FormGroup>

        <FormGroup label="Accuracy:">
          <ControlGroup vertical>
            <NumericInput
              fill
              css={css`margin-bottom: .5em;`}
              readOnly={!props.onChange}
              onValueChange={props.onChange
                ? (valueAsNumber) => props.onChange!(update(props.itemData, { accuracy: { value: { $set: valueAsNumber } } }))
                : undefined}
              value={props.itemData.accuracy.value} />
            <GenericRelatedItemView
              itemRef={{
                classID: 'unit-of-measurement',
                itemID: props.itemData.accuracy.unitOfMeasurement,
              }}
              availableClassIDs={['unit-of-measurement']}
              onClear={props.onChange
                ? () => props.onChange!(update(props.itemData, { accuracy: { unitOfMeasurement: { $set: '' } } }))
                : undefined}
              onChange={props.onChange
                ? (itemRef) => {
                    if (itemRef.classID === 'unit-of-measurement' && itemRef.subregisterID === undefined) {
                      props.onChange!(update(props.itemData, { accuracy: { unitOfMeasurement: { $set: itemRef.itemID } } }))
                    }
                  }
                : undefined}
              itemSorter={COMMON_PROPERTIES.itemSorter}
              getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
              useRegisterItemData={props.useRegisterItemData}
            />
          </ControlGroup>
        </FormGroup>

        {props.itemData.parameters.length > 0
          ? <H3 css={css`margin-top: 1.5em;`}>
              Parameters
            </H3>
          : null}

        <UL css={css`padding-left: 0; list-style: square;`}>
          {props.itemData.parameters.map((param, idx) =>
            <li key={idx} css={css`margin-top: 1em;`}>
              <PropertyDetailView
                  title={`Parameter ${idx + 1}`}
                  secondaryTitle={<Button
                    outlined
                    small
                    disabled={!props.onChange}
                    onClick={() => props.onChange!(update(props.itemData, { parameters: { $splice: [[ idx, 1 ]] } }))}
                  >Delete</Button>}>
                <GenericRelatedItemView
                  itemRef={{ classID: 'coordinate-op-parameter', itemID: param.parameter }}
                  getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                  useRegisterItemData={props.useRegisterItemData}

                  availableClassIDs={['coordinate-op-parameter']}
                  onClear={props.onChange
                    ? () => props.onChange!(update(props.itemData, { parameters: { [idx]: { parameter: { $set: '' } } } }))
                    : undefined}
                  onChange={props.onChange
                    ? (itemRef) => {
                        if (itemRef.classID === 'coordinate-op-parameter') {
                          props.onChange!(update(props.itemData, { parameters: { [idx]: { parameter: { $set: itemRef.itemID }} } }))
                        }
                      }
                    : undefined}
                />
              </PropertyDetailView>

              {/* <PropertyDetailView inline title="Name">{param.name}</PropertyDetailView> */}

              <PropertyDetailView title="Value">
                <ControlGroup vertical css={css`margin-bottom: .5rem;`}>
                  <InputGroup
                    disabled={!props.onChange}
                    fill
                    value={param.value?.toString() ?? '—'}
                    onChange={(evt: React.FormEvent<HTMLInputElement>) =>
                      props.onChange!(update(props.itemData, { parameters: { [idx]: { value: { $set: evt.currentTarget.value } } } }))}
                  />
                </ControlGroup>

              </PropertyDetailView>

            </li>
          )}
        </UL>

        <Button
            outlined
            disabled={!props.onChange}
            onClick={() => props.onChange!(update(props.itemData, { parameters: { $push: [getParameterStub()] } }))}
            icon="add">
          Append parameter
        </Button>
      </CommonEditView>
    ),
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
