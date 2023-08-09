/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';

import React from 'react';
import { css, jsx } from '@emotion/react';
import { Button, ControlGroup, FormGroup, H3, HTMLSelect, InputGroup, NumericInput, UL } from '@blueprintjs/core';

import { Citation, ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import GenericRelatedItemView from '@riboseinc/paneron-registry-kit/views/GenericRelatedItemView';
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



const parameterTypes = [
  'parameter file name',
  'measure (w/ UoM)',
] as const;


interface TransformationParameter {
  parameter: string // Coordinate operation parameter UUID
  unitOfMeasurement: string | null // Unit of measurement UUID
  name: string // Dependent on type? filename?
  type: typeof parameterTypes[number]
  value: string | number | null
  fileCitation: null | Citation
}


function getParameterStub(): TransformationParameter {
  return {
    parameter: '',
    unitOfMeasurement: null,
    name: '',
    type: parameterTypes[0],
    value: null,
    fileCitation: null,
  };
}


export interface TransformationData extends CommonGRItemData {
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
    accuracy: {
      value: 0,
      unitOfMeasurement: '',
    },
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

                <PropertyDetailView title="Value" secondaryTitle={param.type}>
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
          itemRef={props.itemRef}
          itemData={props.itemData}
          onChange={props.onChange ? (newData: CommonGRItemData) => {
            if (!props.onChange) { return; }
            props.onChange({ ...props.itemData, ...newData });
          } : undefined}>

        <FormGroup label="Source CRS:" labelInfo="(editing functionality coming soon)">
          <GenericRelatedItemView
            itemRef={props.itemData.sourceCRS}
            availableClassIDs={['crs--vertical', 'crs--geodetic']}
            onClear={props.onChange
              ? () => props.onChange!(update(props.itemData, { $unset: ['sourceCRS'] }))
              : undefined}
            onChange={props.onChange
              ? (itemRef) => {
                  if (itemRef.classID.startsWith('crs--')) {
                    props.onChange!(update(props.itemData, { sourceCRS: { $set: itemRef } }))
                  }
                }
              : undefined}

            itemSorter={COMMON_PROPERTIES.itemSorter}
            getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
            useRegisterItemData={props.useRegisterItemData}
          />
        </FormGroup>

        <FormGroup label="Target CRS:" labelInfo="(editing functionality coming soon)">
          <GenericRelatedItemView
            itemRef={props.itemData.targetCRS}
            availableClassIDs={['crs--vertical', 'crs--geodetic']}
            onClear={props.onChange
              ? () => props.onChange!(update(props.itemData, { $unset: ['targetCRS'] }))
              : undefined}
            onChange={props.onChange
              ? (itemRef) => {
                  if (itemRef.classID.startsWith('crs--')) {
                    props.onChange!(update(props.itemData, { targetCRS: { $set: itemRef } }))
                  }
                }
              : undefined}

            itemSorter={COMMON_PROPERTIES.itemSorter}
            getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
            useRegisterItemData={props.useRegisterItemData}
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

        <FormGroup label="Operation version:">
          <InputGroup
            placeholder="E.g., GA v2"
            value={props.itemData.operationVersion ?? ''}
            disabled={!props.onChange}
            onChange={(evt: React.FormEvent<HTMLInputElement>) => {
              props.onChange
                ? props.onChange(update(props.itemData, { operationVersion: { $set: evt.currentTarget.value } }))
                : void 0;
            }}
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

              <PropertyDetailView title="Value" secondaryTitle={param.type}>
                <ControlGroup vertical css={css`margin-bottom: .5rem;`}>
                  <HTMLSelect
                    value={param.type}
                    options={parameterTypes.map(param => ({ value: param, label: param }))}
                    onChange={(evt) =>
                      props.onChange!(update(props.itemData, { parameters: { [idx]: { type: { $set: evt.currentTarget.value as typeof parameterTypes[number] } } } }))
                    }
                  />
                  <InputGroup
                    disabled={!props.onChange}
                    fill
                    value={param.value?.toString() ?? '—'}
                    onChange={(evt: React.FormEvent<HTMLInputElement>) =>
                      props.onChange!(update(props.itemData, { parameters: { [idx]: { value: { $set: evt.currentTarget.value } } } }))}
                  />
                </ControlGroup>

                {param.unitOfMeasurement || param.type === 'measure (w/ UoM)'
                  ? <GenericRelatedItemView
                      itemRef={{ classID: 'unit-of-measurement', itemID: param.unitOfMeasurement ?? '' }}
                      getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                      useRegisterItemData={props.useRegisterItemData}

                      availableClassIDs={['unit-of-measurement']}
                      onClear={props.onChange
                        ? () => props.onChange!(update(props.itemData, { parameters: { [idx]: { unitOfMeasurement: { $set: null } } } }))
                        : undefined}
                      onChange={props.onChange
                        ? (itemRef) => {
                            props.onChange!(update(props.itemData, { parameters: { [idx]: { unitOfMeasurement: { $set: itemRef.itemID } } } }))
                          }
                        : undefined}
                    />
                  : null}
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

        <Button
            outlined
            disabled={!props.onChange}
            onClick={() => props.onChange!(update(props.itemData, { parameters: { $push: [getParameterStub()] } }))}
            icon="add">
          Append parameter
        </Button>

      </CommonEditView>
    </>,
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
