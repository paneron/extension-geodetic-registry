/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';

import React from 'react';
import { Button, InputGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import type { Payload, ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { useSingleRegisterItemData, PropertyDetailView } from '@riboseinc/paneron-registry-kit';

import {
  type Extent,
  CombinedExtentWidget,
  DEFAULT_EXTENT,
} from './extent';
import {
  type CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  COMMON_PROPERTIES,
  RelatedItem,
} from './common';

import ItemTable, { type ColumnInfo } from '../helpers/ItemTable';


/**
 * Similar to transformation parameters, but limited
 * to only a measure w/UoM (and thus excluding type).
 */
export interface ConversionParameter {
  parameter: string // Coordinate operation parameter UUID
  unitOfMeasurement: string | null // Unit of measurement UUID
  //name: string // Dependent on type? filename? TODO: Doesn’t exist
  value: string | number | null
}


function getParameterStub(): ConversionParameter {
  return {
    parameter: '',
    unitOfMeasurement: null,
    //name: '',
    value: null,
  };
}

export interface ConversionData extends CommonGRItemData {
  extent: Extent

  /** UUID of relevant Extent item. */
  extentRef?: string

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
    editView: ({ itemData, itemRef, onChange }) => {

      // NOTE: Yes, Transformation has similar logic, but refactoring this for DRY
      // is ill-advised at least until Transformation and Conversion themselves
      // are refactored using a single common ancestor class (SingleOperation or the like),
      // but ideally until users have the ability to specify this logic themselves.
      // Refactoring it here 
      const coordMethodParamUUIDs: string[] = (useSingleRegisterItemData(
          itemData.coordinateOperationMethod
          ? { classID: 'coordinate-op-method', itemID: itemData.coordinateOperationMethod }
          : null
      // Cast to Payload is necessary due to RegistryKit wrongly typing useSingleRegisterItemData value
      ).value as Payload)?.parameters ?? [];
      const itemParamParamUUIDs = (itemData.parameters ?? []).map(param => param.parameter);
      const missingParameters = React.useMemo(() => (
        coordMethodParamUUIDs.filter(uuid => itemParamParamUUIDs.indexOf(uuid) < 0)
      ), [itemParamParamUUIDs.toString(), coordMethodParamUUIDs.toString()]);

      const createParameterValueStub: () => ConversionParameter = React.useCallback(() => {
        return {
          ...getParameterStub(),
          parameter: missingParameters[0] ?? '',
        };
      }, [missingParameters[0]]);

      const createStubsForMissingOperationMethodParameters = React.useMemo(() =>
        onChange && missingParameters.length > 0
          ? function () {
              const paramValueStubs = missingParameters.map(paramUUID => ({
                ...getParameterStub(),
                parameter: paramUUID,
              }));
              onChange(update(itemData, { parameters: { $splice: [[0, 0, ...paramValueStubs]] } }));
            }
          : null,
        [onChange, missingParameters]);
      return (
        <CommonEditView
            itemData={itemData}
              itemRef={itemRef}
              onChange={onChange ? (newData: CommonGRItemData) => {
                if (!onChange) { return; }
                onChange({ ...itemData, ...newData });
              } : undefined}>

          <PropertyDetailView
              subLabel="The coordinate operation method to be used for this operation."
              helperText={createStubsForMissingOperationMethodParameters
                ? <Button
                      small
                      outlined
                      onClick={createStubsForMissingOperationMethodParameters}
                      icon="add"
                      title="Linked operation method has some parameters the values for which are not specified on this item.">
                    Create stubs for {missingParameters.length} missing parameter values
                  </Button>
                : undefined}
              title="Coordinate operation method">
            <RelatedItem
              itemRef={itemData.coordinateOperationMethod
                ? { classID: 'coordinate-op-method', itemID: itemData.coordinateOperationMethod }
                : undefined}
              mode="id"
              onClear={onChange
                && (() => onChange!(update(itemData, { $unset: ['coordinateOperationMethod'] })))}
              onSet={onChange
                ? ((spec) => onChange!(update(itemData, { coordinateOperationMethod: spec })))
                : undefined}
              classIDs={['coordinate-op-method']}
            />
          </PropertyDetailView>

          <PropertyDetailView label="Scope">
            <InputGroup
              required
              value={itemData.scope ?? ''}
              readOnly={!onChange}
              onChange={(evt) => onChange?.({ ...itemData, scope: evt.currentTarget.value })}
            />
          </PropertyDetailView>

          <CombinedExtentWidget
            extent={itemData.extent}
            extentRef={itemData.extentRef}
            onRefChange={onChange
              ? (ref) => onChange!(update(itemData, { extentRef: { $set: ref } }))
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

          <ItemTable
            items={itemData.parameters}
            itemLabel="parameter with value"
            itemLabelPlural="operation parameters with values"
            onChangeItems={onChange
              ? (spec) => onChange!(update(itemData, { parameters: spec }))
              : undefined}
            placeholderItem={createParameterValueStub}
            columnInfo={React.useMemo(() => ({
              parameter: {
                title: "Coordinate operation parameter",
                width: 320,
                CellRenderer: function renderConversionParameterParameter ({ val, onChange }) {
                  return <RelatedItem
                    itemRef={{ classID: 'coordinate-op-parameter', itemID: val ?? '' }}
                    mode="id"
                    classIDs={['coordinate-op-parameter']}
                    onClear={onChange
                      ? () => onChange!({ $set: '' })
                      : undefined}
                    onSet={onChange}
                  />
                }
              },
              value: {
                title: "Value",
                width: 128,
                CellRenderer: function renderConversionParameterValue ({ val, onChange }) {
                  return <InputGroup
                    readOnly={!onChange}
                    fill
                    value={val?.toString() ?? ''}
                    onChange={(evt: React.FormEvent<HTMLInputElement>) =>
                      onChange!({ $set: evt.currentTarget.value })}
                  />;
                },
              },
              unitOfMeasurement: {
                title: "Unit of Measurement",
                width: 256,
                CellRenderer: function renderConversionParameterUoM ({ val, onChange }) {
                  return <RelatedItem
                    itemRef={{ classID: 'unit-of-measurement', itemID: val ?? '' }}
                    fill
                    mode="id"
                    classIDs={['unit-of-measurement']}
                    onClear={onChange
                      ? () => onChange!({ $set: '' })
                      : undefined}
                    onSet={onChange}
                  />
                },
              },
            }), []) as ColumnInfo<ConversionParameter>}
          />
        </CommonEditView>
      );
    },
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
