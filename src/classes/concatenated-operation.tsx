/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';

/* import React from 'react'; */
import { ControlGroup, FormGroup, H3, NumericInput, UL } from '@blueprintjs/core';
// import { TextArea, InputGroup, ControlGroup, Button } from '@blueprintjs/core';
import { css, jsx } from '@emotion/react';
import { ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
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

{/* interface ConcatenatedOperationParameter { */}
{/*   parameter: string // Coordinate operation parameter UUID */}
{/*   unitOfMeasurement: string | null // Unit of measurement UUID */}
{/*   name: string // Dependent on type? filename? */}
{/*   value: string | number | null */}
{/* } */}


{/* function getParameterStub(): ConcatenatedOperationParameter { */}
{/*   return { */}
{/*     parameter: '', */}
{/*     unitOfMeasurement: null, */}
{/*     name: '', */}
{/*     value: null, */}
{/*   }; */}
{/* } */}

export interface ConcatenatedOperationData extends CommonGRItemData {
  aliases: string[]
  extent: Extent
  accuracy: {
    value: number
    unitOfMeasurement: string // Unit of measurement UUID
  }
  operationVersion: string
  coordinateOperations: { classID: string, itemID: string }[]
  scope: string
  sourceCRS?: { classID: string, itemID: string }
  targetCRS?: { classID: string, itemID: string }
}

export const DEFAULTS: ConcatenatedOperationData = {
  ...SHARED_DEFAULTS,
  accuracy: {
    value: 0,
    unitOfMeasurement: '',
  },
  operationVersion: '',
  aliases: [],
  extent: DEFAULT_EXTENT,
  scope: '',
  coordinateOperations: [],
};


export const concatenatedOperation: ItemClassConfiguration<ConcatenatedOperationData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Concatenated Operation",
    description: "Coordinate Operations — Concatenated Operation",
    id: 'coordinate-ops--concatenated-operation',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<ConcatenatedOperationData>,
    detailView: (props) => {
      const data = props.itemData;
      const extent = data.extent;
      const coordinateOperations = data.coordinateOperations ?? [];

      return (
        <CommonDetailView {...props}>

          {(data.aliases || []).length > 0
            ? <AliasesDetail aliases={data.aliases} />
            : null}

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

          {/* <PropertyDetailView title="Coordinate Operations"> */}
          {/*   <ControlGroup vertical> */}
          {/*     {props.itemData.coordinateOperations.map((coordinateOperation, idx) => */}
          {/*       <InputGroup */}
          {/*         key={idx} */}
          {/*         fill */}
          {/*         required */}
          {/*         value={coordinateOperation} */}
          {/*         readOnly={!props.onChange} */}
          {/*         rightElement={props.onChange */}
          {/*           ? <Button */}
          {/*               icon='cross' */}
          {/*               onClick={() => props.onChange!(update( */}
          {/*                 props.itemData, */}
          {/*                 { coordinateOperations: { $splice: [[ idx, 1 ]] } } */}
          {/*               ))} */}
          {/*             /> */}
          {/*           : undefined} */}
          {/*         onChange={evt => props.onChange!(update( */}
          {/*           props.itemData, */}
          {/*           { coordinateOperations: { [idx]: { $set: evt.currentTarget.value } } }, */}
          {/*         ))} */}
          {/*       /> */}
          {/*     )} */}
          {/*     {props.onChange */}
          {/*       ? <Button icon='add' onClick={() => props.onChange!(update( */}
          {/*           props.itemData, */}
          {/*           { coordinateOperations: { $push: [''] } }, */}
          {/*         ))}> */}
          {/*           Add coordinate operation */}
          {/*         </Button> */}
          {/*       : undefined} */}
          {/*   </ControlGroup> */}
          {/* </PropertyDetailView> */}

          <H3>Coordinate Operations</H3>
          <UL css={css`padding-left: 0; list-style: square;`}>
            {coordinateOperations.map((coordinateOperation, idx) =>
              <li key={idx} css={css`margin-top: 1em;`}>
                <PropertyDetailView title={`Coordinate Operation ${idx + 1}`}>
                  <GenericRelatedItemView
                    itemRef={coordinateOperation}
                    availableClassIDs={['coordinate-ops--conversion', 'coordinate-ops--transformation',]}
                    getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                    useRegisterItemData={props.useRegisterItemData}
                  />
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


        {/* <FormGroup label="Coordinate Operations:"> */}
        {/*   <GenericRelatedItemView */}
        {/*     itemRef={coordinateOperation} */}
        {/*     availableClassIDs={['coordinate-ops--conversion', 'coordinate-ops--transformation',]} */}
        {/*     onClear={props.onChange */}
        {/*       ? () => props.onChange!(update(props.itemData, { $unset: ['sourceCRS'] })) */}
        {/*       : undefined} */}
        {/*     onChange={props.onChange */}
        {/*       ? (itemRef) => { */}
        {/*           if (itemRef.classID.startsWith('crs--')) { */}
        {/*             props.onChange!(update(props.itemData, { sourceCRS: { $set: itemRef } })) */}
        {/*           } */}
        {/*         } */}
        {/*       : undefined} */}

        {/*     itemSorter={COMMON_PROPERTIES.itemSorter} */}
        {/*     getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration} */}
        {/*     useRegisterItemData={props.useRegisterItemData} */}
        {/*   /> */}
        {/* </FormGroup> */}

      </CommonEditView>
    ),
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
