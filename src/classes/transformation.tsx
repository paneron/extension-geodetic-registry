/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';

import React from 'react';
import { jsx, css } from '@emotion/react';
import { Drawer, Button, ButtonGroup, HTMLSelect, InputGroup } from '@blueprintjs/core';

import type { Payload, Citation, ItemClassConfiguration, InternalItemReference, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { useSingleRegisterItemData, PropertyDetailView } from '@riboseinc/paneron-registry-kit';
import {
  type Extent,
  CombinedExtentWidget,
  DEFAULT_EXTENT,
} from './extent';
import {
  type CommonGRItemData,
  COMMON_PROPERTIES,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  InformationSourceEdit,
  getInformationSourceStub,
  RelatedItem,
  ItemTable,
  type ColumnInfo,
  type Accuracy,
  AccuracyEdit,
  ACCURACY_STUB,
} from './common';


export const ParameterValueType = {
  FILE: 'parameter file name',
  MEASURE: 'measure (w/ UoM)',
} as const;

const parameterValueTypes = [
  ParameterValueType.FILE,
  ParameterValueType.MEASURE,
] as const;

export interface TransformationParameter {
  parameter: string // Coordinate operation parameter UUID
  unitOfMeasurement: string | null // Unit of measurement UUID
  //name: string // Dependent on type? filename? TODO: Doesn’t exist?
  type: typeof parameterValueTypes[number]
  value: string | number | null
  fileCitation: null | Citation
}


function getParameterStub(): TransformationParameter {
  return {
    parameter: '',
    unitOfMeasurement: null,
    //name: '',
    type: parameterValueTypes[0],
    value: null,
    fileCitation: null,
  };
}


export interface TransformationData extends CommonGRItemData {
  extent: Extent
  /** UUID of relevant Extent item. */
  extentRef?: string
  scope: string
  operationVersion: string
  accuracy: Accuracy
  parameters: Readonly<TransformationParameter[]>

  sourceCRS?: InternalItemReference
  targetCRS?: InternalItemReference
  coordOperationMethod?: string
}


export const transformation: ItemClassConfiguration<TransformationData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Transformation",
    description: "Coordinate Operations — Transformation",
    id: 'coordinate-ops--transformation',
    alternativeNames: [] as const,
  },
  defaults: {
    ...SHARED_DEFAULTS,
    extent: DEFAULT_EXTENT,
    scope: '',
    operationVersion: '',
    parameters: [],
    accuracy: ACCURACY_STUB,
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
      const missingParameters = React.useMemo(() => (
        coordMethodParamUUIDs.filter(uuid => itemParamParamUUIDs.indexOf(uuid) < 0)
      ), [itemParamParamUUIDs.toString(), coordMethodParamUUIDs.toString()]);

      const createParameterValueStub: () => TransformationParameter = React.useCallback(() => {
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

      const [paramWithOpenCitation, setParamWithOpenCitation] =
        React.useState<null | number>(null);

      const fileCitationBeingEdited = paramWithOpenCitation !== null
        ? itemData.parameters[paramWithOpenCitation].fileCitation ?? null
        : null;

      return (
        <>
          <Drawer
              isOpen={fileCitationBeingEdited !== null}
              usePortal
              css={css`padding: 10px; overflow-y: auto;`}
              onClose={React.useCallback(() => setParamWithOpenCitation(null), [])}>
            {fileCitationBeingEdited !== null
              ? <InformationSourceEdit
                  citation={fileCitationBeingEdited}
                  onChange={onChange
                    ? (citation) => onChange!(update(itemData, { parameters: { [paramWithOpenCitation as number]: { fileCitation: { $set: citation } } } } ))
                    : undefined}
                />
              : null}
          </Drawer>
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

            <PropertyDetailView
                label="Operation version"
                helperText={onChange ? <>For example, <code>GA v2</code></> : undefined}>
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

            <AccuracyEdit
              accuracy={itemData.accuracy}
              onChange={onChange
                ? ((accuracy) => onChange(update(itemData, { accuracy: { $set: accuracy } } )))
                : undefined}
            />

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
                  CellRenderer: function renderTransformationParameterParameter ({ val, onChange }) {
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
                type: {
                  title: "Value Type",
                  width: 160,
                  CellRenderer: function renderTransformationParameterValueType ({ val, onChange }) {
                    return (onChange
                      ? <HTMLSelect
                          value={val}
                          options={parameterValueTypes.map(param => ({ value: param, label: param }))}
                          disabled={!onChange}
                          onChange={(evt) =>
                            onChange!({ $set: evt.currentTarget.value as typeof parameterValueTypes[number] })
                          }
                        />
                      : <InputGroup readOnly value={val} />
                    );
                  },
                },
                value: {
                  title: "Value",
                  width: 128,
                  CellRenderer: function renderTransformationParameterValue ({ val, onChange }) {
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
                  CellRenderer: function renderTransformationParameterUoM ({ val, onChange, item }) {
                    return (val || item.type === ParameterValueType.MEASURE
                      ? <RelatedItem
                          itemRef={{ classID: 'unit-of-measurement', itemID: val ?? '' }}
                          fill
                          mode="id"
                          classIDs={['unit-of-measurement']}
                          onClear={onChange
                            ? () => onChange!({ $set: '' })
                            : undefined}
                          onSet={onChange}
                        />
                      : null
                    );
                  },
                },
                fileCitation: {
                  title: "Information Source",
                  width: 192,
                  CellRenderer: function renderTransformationParameterFileCitation ({ val, onChange, itemIndex }) {
                    const hasVal = val !== null && val !== undefined;
                    return <>
                      <ButtonGroup>
                        {val && onChange
                          ? <Button
                              onClick={() => onChange({ $set: null })}
                              icon='remove'
                              title="Remove information source"
                            />
                          : null}
                        <Button
                            disabled={!onChange && !hasVal}
                            icon={onChange
                              ? hasVal
                                ? 'edit'
                                : 'add'
                              : hasVal
                                ? 'eye-open'
                                : undefined}
                            onClick={() => {
                              if (onChange && !hasVal) {
                                onChange({ $set: getInformationSourceStub() });
                              }
                              setParamWithOpenCitation(itemIndex);
                            }}>
                          {onChange
                            ? hasVal
                              ? val.title?.trim() ?? "Untitled source"
                              : "Add"
                            : hasVal
                              ? val.title?.trim() ?? "Untitled source"
                              : "N/A"}
                        </Button>
                      </ButtonGroup>
                    </>;
                  },
                },
              }), []) as ColumnInfo<TransformationParameter>}
            />

          </CommonEditView>
        </>
      )
    },
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
} as const;
