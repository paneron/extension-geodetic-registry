/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';

import React from 'react';
import { ControlGroup, InputGroup } from '@blueprintjs/core';
import { css, jsx } from '@emotion/react';
import type { ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';

import {
  type CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  COMMON_PROPERTIES,
  type Extent,
  ExtentEdit,
  ItemList,
  RelatedItem,
  DEFAULT_EXTENT,
} from './common';


/**
 * Similar to transformation parameters, but limited
 * to only a measure w/UoM (and thus excluding type).
 */
export interface ConversionParameter {
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
  extent: Extent
  // accuracy: {
  //   value: number
  //   unitOfMeasurement: string // Unit of measurement UUID
  // }
  // epsg:<id>

  parameters: Readonly<ConversionParameter[]>

  // uuid
  coordinateOperationMethod?: string
  scope: string
}

export const DEFAULTS: ConversionData = {
  ...SHARED_DEFAULTS,
  // accuracy: {
  //   value: 0,
  //   unitOfMeasurement: '',
  // },
  parameters: [],
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
    editView: ({ itemData, itemRef, onChange }) => (
      <CommonEditView
        itemData={itemData}
        itemRef={itemRef}
        onChange={onChange ? (newData: CommonGRItemData) => {
          if (!onChange) { return; }
          onChange({ ...itemData, ...newData });
        } : undefined}>

        <ExtentEdit
          extent={itemData.extent ?? DEFAULT_EXTENT}
          onChange={onChange
            ? (extent) => onChange!(update(itemData, { extent: { $set: extent } }))
            : undefined}
        />

        {/*
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
        */}

        <ItemList
          items={itemData.parameters}
          itemLabel="parameter value"
          itemLabelPlural="parameter values"
          onChangeItems={onChange
            ? (spec) => onChange!(update(itemData, { parameters: spec }))
            : undefined}
          placeholderItem={getParameterStub()}
          itemRenderer={(param, _idx, handleChange, deleteButton) =>
            <PropertyDetailView title="Parameter Value" helperText={deleteButton}>
              <PropertyDetailView title="Parameter">
                <RelatedItem
                  itemRef={{ classID: 'coordinate-op-parameter', itemID: param.parameter }}
                  mode="id"
                  classIDs={['coordinate-op-parameter']}
                  onClear={onChange
                    ? () => handleChange!({ parameter: { $set: '' } })
                    : undefined}
                  onSet={handleChange
                    ? (spec) => handleChange!({ parameter: spec })
                    : undefined}
                />
              </PropertyDetailView>

              {/* <PropertyDetailView inline title="Name">{param.name}</PropertyDetailView> */}

              <PropertyDetailView title="Value">
                <ControlGroup vertical css={css`margin-bottom: .5rem;`}>
                  <InputGroup
                    readOnly={!onChange}
                    fill
                    value={param.value?.toString() ?? ''}
                    onChange={(evt: React.FormEvent<HTMLInputElement>) =>
                      handleChange!({ value: { $set: evt.currentTarget.value } } )}
                  />
                  <RelatedItem
                    itemRef={{ classID: 'unit-of-measurement', itemID: param.unitOfMeasurement ?? '' }}
                    mode="id"
                    classIDs={['unit-of-measurement']}
                    onClear={handleChange
                      ? () => handleChange!({ unitOfMeasurement: { $set: null } })
                      : undefined}
                    onSet={handleChange
                      ? (spec) => handleChange!({ unitOfMeasurement: spec })
                      : undefined}
                  />
                </ControlGroup>
              </PropertyDetailView>
            </PropertyDetailView>
          }
        />
      </CommonEditView>
    ),
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
