/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';

import React from 'react';
import { Button, ControlGroup, InputGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import type { Payload, ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { useSingleRegisterItemData, PropertyDetailView } from '@riboseinc/paneron-registry-kit';

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
            placeholderItem={createParameterValueStub}
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
                  {/* NOTE: `fill`s are critical within this widget, to avoid weird clipping. */}
                  <ControlGroup fill>
                    <InputGroup
                      readOnly={!onChange}
                      fill
                      value={param.value?.toString() ?? ''}
                      onChange={(evt: React.FormEvent<HTMLInputElement>) =>
                        handleChange!({ value: { $set: evt.currentTarget.value } } )}
                    />
                    <RelatedItem
                      itemRef={{ classID: 'unit-of-measurement', itemID: param.unitOfMeasurement ?? '' }}
                      fill
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
      );
    },
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
