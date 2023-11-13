/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';

import React, { useCallback, useMemo } from 'react';
import { css, jsx } from '@emotion/react';
import { Button, ControlGroup, HTMLSelect, InputGroup, NumericInput } from '@blueprintjs/core';

import type { Payload, Citation, ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import useSingleRegisterItemData from '@riboseinc/paneron-registry-kit/views/hooks/useSingleRegisterItemData';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import GenericRelatedItemView from '@riboseinc/paneron-registry-kit/views/GenericRelatedItemView';
import {
  type CommonGRItemData,
  COMMON_PROPERTIES,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  type Extent,
  ExtentEdit,
  InformationSourceEdit,
  DEFAULT_EXTENT,
  ItemList,
  RelatedItem,
  getInformationSourceStub,
} from './common';



export const ParameterType = {
  FILE: 'parameter file name',
  MEASURE: 'measure (w/ UoM)',
} as const;

const parameterTypes = [
  ParameterType.FILE,
  ParameterType.MEASURE,
] as const;

export interface TransformationParameter {
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
  parameters: Readonly<TransformationParameter[]>

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

    editView: ({ itemData, onChange, ...props }) => {

      // NOTE: Yes, Conversion has similar logic, but refactoring this for DRY
      // is ill-advised at least until Transformation and Conversion themselves
      // are refactored using a single common ancestor class (SingleOperation or the like),
      // but ideally until users have the ability to specify this logic themselves.
      // Refactoring it here 
      const coordMethodParamUUIDs: string[] = (useSingleRegisterItemData(
          itemData.coordOperationMethod
          ? { classID: 'coordinate-op-method', itemID: itemData.coordOperationMethod }
          : null
      // Cast to Payload is necessary due to RegistryKit wrongly typing useSingleRegisterItemData value
      ).value as Payload)?.parameters ?? [];
      const itemParamParamUUIDs = (itemData.parameters ?? []).map(param => param.parameter);
      const missingParameters = useMemo(() => (
        coordMethodParamUUIDs.filter(uuid => itemParamParamUUIDs.indexOf(uuid) < 0)
      ), [itemParamParamUUIDs.toString(), coordMethodParamUUIDs.toString()]);

      const createParameterValueStub: () => TransformationParameter = useCallback(() => {
        return {
          ...getParameterStub(),
          parameter: missingParameters[0] ?? '',
        };
      }, [missingParameters[0]]);

      const createStubsForMissingOperationMethodParameters = useMemo(() =>
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
        <>
          <CommonEditView
              useRegisterItemData={props.useRegisterItemData}
              getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
              itemRef={props.itemRef}
              itemData={itemData}
              onChange={onChange ? (newData: CommonGRItemData) => {
                if (!onChange) { return; }
                onChange({ ...itemData, ...newData });
              } : undefined}>

            <PropertyDetailView title="Source CRS">
              <RelatedItem
                itemRef={itemData.sourceCRS}
                mode="generic"
                onClear={onChange
                  && (() => onChange!(update(itemData, { $unset: ['sourceCRS'] })))}
                onSet={onChange
                  ? ((spec) => onChange!(update(itemData, { sourceCRS: spec })))
                  : undefined}
                classIDs={['crs--vertical', 'crs--geodetic']}
              />
            </PropertyDetailView>

            <PropertyDetailView title="Target CRS">
              <RelatedItem
                itemRef={itemData.targetCRS}
                mode="generic"
                onClear={onChange
                  && (() => onChange!(update(itemData, { $unset: ['targetCRS'] })))}
                onSet={onChange
                  ? ((spec) => onChange!(update(itemData, { targetCRS: spec })))
                  : undefined}
                classIDs={['crs--vertical', 'crs--geodetic']}
              />
            </PropertyDetailView>

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
                itemRef={itemData.coordOperationMethod
                  ? { classID: 'coordinate-op-method', itemID: itemData.coordOperationMethod }
                  : undefined}
                mode="id"
                onClear={onChange
                  && (() => onChange!(update(itemData, { $unset: ['coordOperationMethod'] })))}
                onSet={onChange
                  ? ((spec) => onChange!(update(itemData, { coordOperationMethod: spec })))
                  : undefined}
                classIDs={['coordinate-op-method']}
              />
            </PropertyDetailView>

            <ExtentEdit
              extent={itemData.extent ?? DEFAULT_EXTENT}
              onChange={onChange
                ? (extent) => onChange!(update(itemData, { extent: { $set: extent } }))
                : undefined}
            />

            <PropertyDetailView label="Operation version" helperText={<>For example, <code>GA v2</code></>}>
              <InputGroup
                value={itemData.operationVersion ?? ''}
                readOnly={!onChange}
                onChange={(evt: React.FormEvent<HTMLInputElement>) => {
                  onChange
                    ? onChange(update(itemData, { operationVersion: { $set: evt.currentTarget.value } }))
                    : void 0;
                }}
              />
            </PropertyDetailView>

            <PropertyDetailView label="Accuracy">
              <ControlGroup vertical>
                <NumericInput
                  fill
                  css={css`margin-bottom: .5em;`}
                  readOnly={!onChange}
                  onValueChange={onChange
                    ? (valueAsNumber) => onChange!(update(itemData, { accuracy: { value: { $set: valueAsNumber } } }))
                    : undefined}
                  value={itemData.accuracy.value}
                />
                <GenericRelatedItemView
                  itemRef={{
                    classID: 'unit-of-measurement',
                    itemID: itemData.accuracy.unitOfMeasurement,
                  }}
                  availableClassIDs={['unit-of-measurement']}
                  onClear={onChange
                    ? () => onChange!(update(itemData, { accuracy: { unitOfMeasurement: { $set: '' } } }))
                    : undefined}
                  onChange={onChange
                    ? (itemRef) => {
                        if (itemRef.classID === 'unit-of-measurement' && itemRef.subregisterID === undefined) {
                          onChange!(update(itemData, { accuracy: { unitOfMeasurement: { $set: itemRef.itemID } } }))
                        }
                      }
                    : undefined}
                  itemSorter={COMMON_PROPERTIES.itemSorter}
                  getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                  useRegisterItemData={props.useRegisterItemData}
                />
              </ControlGroup>
            </PropertyDetailView>

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

                  <PropertyDetailView label="Value type">
                    {handleChange
                      ? <HTMLSelect
                          value={param.type}
                          options={parameterTypes.map(param => ({ value: param, label: param }))}
                          onChange={(evt) =>
                            handleChange!({ type: { $set: evt.currentTarget.value as typeof parameterTypes[number] } })
                          }
                        />
                      : <InputGroup readOnly value={param.type} />}
                  </PropertyDetailView>

                  <PropertyDetailView
                      helperText="Depending on value type, either 1) a numerical value with unit of measurement, or 2) a filename."
                      label="Value">
                    <ControlGroup>
                      <InputGroup
                        readOnly={!onChange}
                        fill
                        value={param.value?.toString() ?? ''}
                        onChange={(evt: React.FormEvent<HTMLInputElement>) =>
                          handleChange!({ value: { $set: evt.currentTarget.value } } )}
                      />

                      {param.unitOfMeasurement || param.type === ParameterType.MEASURE
                        ? <RelatedItem
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
                        : null}
                    </ControlGroup>
                  </PropertyDetailView>

                  {param.type === ParameterType.FILE || param.fileCitation !== null
                    ? <PropertyDetailView
                          helperText={param.fileCitation && handleChange
                            ? <Button
                                  onClick={() => handleChange!({ $unset: ['fileCitation'] })}
                                  icon="remove"
                                  outlined
                                  intent="danger">
                                Remove file citation
                              </Button>
                            : handleChange
                              ? <Button
                                    onClick={() => handleChange({ fileCitation: { $set: getInformationSourceStub() } })}
                                    intent="primary"
                                    outlined
                                    title="Add file citation"
                                    icon="add">
                                  Add
                                </Button>
                              : null}
                          label="File citation">
                        {param.fileCitation
                          ? <InformationSourceEdit
                              citation={param.fileCitation}
                              onChange={handleChange
                                ? (citation) => handleChange!({ fileCitation: { $set: citation } })
                                : undefined}
                            />
                          : "N/A"}
                      </PropertyDetailView>
                    : null}
                </PropertyDetailView>
              }
            />
          </CommonEditView>
        </>
      )
    },
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
} as const;
