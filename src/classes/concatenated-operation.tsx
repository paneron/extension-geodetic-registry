/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';

import React, { useContext, useMemo } from 'react';
import { jsx } from '@emotion/react';
import { ControlGroup, InputGroup } from '@blueprintjs/core';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import { itemRefToItemPath } from '@riboseinc/paneron-registry-kit/views/itemPathUtils';
import { BrowserCtx } from '@riboseinc/paneron-registry-kit/views/BrowserCtx';
import type { RegisterItem, InternalItemReference, ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';

import {
  type CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  COMMON_PROPERTIES,
  ItemList,
  RelatedItem,
  Accuracy,
  AccuracyEdit,
  ACCURACY_STUB,
} from './common';

import type { TransformationData } from './transformation';
import type { ConversionData } from './conversion';


export interface ConcatenatedOperationData extends CommonGRItemData {
  /**
   * Ordered list of references to single operations.
   * Must contain at least two.
   */
  operations: Readonly<InternalItemReference[]>
  scope: string
  operationVersion: string
  accuracy: Accuracy
}


export const concatenatedOperation: ItemClassConfiguration<ConcatenatedOperationData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Concatenated Operation",
    description: "Coordinate Operations — Concatenated Operation",
    id: 'coordinate-ops--concatenated',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
    operationVersion: '',
    operations: [],
    accuracy: ACCURACY_STUB,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<ConcatenatedOperationData>,

    editView: function ConcatenatedOperationEditView ({ itemData, onChange, ...props }) {
      const { useRegisterItemData } = useContext(BrowserCtx);
      const operationItemPaths = itemData.operations.map(ref => itemRefToItemPath(ref));

      /** Item data for every linked single operation. */
      const operationItemData = useRegisterItemData({
        itemPaths: operationItemPaths,
      }).value as Record<string, RegisterItem<TransformationData | ConversionData> | null>;

      /**
       * [source, target] CRS item paths for every linked single operation.
       * Operations with either CRS missing are omitted.
       */
      const crsRefs: Record<string, [string, string]> = useMemo(() =>
        Object.values(operationItemData).
          filter(op => op !== null && op !== undefined).
          map(op => {
            let crsPaths: [string, string] = ['', ''];
            if (op!.data) {
              const opData = op!.data as any;
              crsPaths = [
                opData.sourceCRS ? itemRefToItemPath(opData.sourceCRS) : '',
                opData.targetCRS ? itemRefToItemPath(opData.targetCRS) : '',
              ];
            }
            return [op!.id, crsPaths] as [string, [string, string]];
          }).
          filter(([_, paths]) => (paths.find(p => p === '') === undefined)).
          map(([opID, paths]) =>
            ({ [opID]: [paths[0], paths[1]] as [string, string] })
          ).
          reduce((prev, curr) => ({ ...prev, ...curr }), {}),
        [operationItemData]);

      /** CRS data for every linked CRS, through linked operations. */
      const crsItemData = useRegisterItemData({
        itemPaths: [...Object.values(crsRefs)].flat(),
      });

      /**
       * Maps each operation item UUID to custom validation error
       * (empty string if no error).
       */
      const operationValidationErrors: Record<string, string> = useMemo(() => {
        const ops = itemData.operations.map(ref => ref.itemID);
        const errors: Record<string, string> = {};
        let previousTarget: string | null = null;
        for (const opUUID of ops) {
          if (crsRefs[opUUID]) {
            if (!previousTarget) {
              previousTarget = crsRefs[opUUID][1];
              errors[opUUID] = "";
            } else {
              if (crsRefs[opUUID][0] !== previousTarget) {
                errors[opUUID] = "Source CRS of this operation does not match target CRS of previous operation";
              } else {
                errors[opUUID] = "";
              }
            }
          } else {
            console.warn("Source/target CRS for operation with UUID were not retrieved:", opUUID);
            errors[opUUID] = "Unable to fetch source/target CRS for this operation.";
          }
        }
        return errors;
      }, [crsItemData]);

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

            <AccuracyEdit
              accuracy={itemData.accuracy}
              onChange={onChange
                ? ((accuracy) => onChange(update(itemData, { accuracy: { $set: accuracy } } )))
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

            <ItemList
              items={itemData.operations}
              itemLabel="operation"
              itemLabelPlural="operations"
              onChangeItems={onChange
                ? (spec) => onChange!(update(itemData, { operations: spec }))
                : undefined}
              placeholderItem={{ classID: 'coordinate-ops--transformation', itemID: '' }}
              simpleItems
              itemRenderer={(opRef, _idx, handleChange, deleteButton) =>
                <ControlGroup>
                  <RelatedItem
                    itemRef={opRef}
                    validity={operationValidationErrors[opRef.itemID]}
                    mode="generic"
                    classIDs={['coordinate-ops--transformation', 'coordinate-ops--conversion']}
                    onSet={handleChange
                      ? (spec) => handleChange!(spec)
                      : undefined}
                  />
                  {deleteButton}
                </ControlGroup>
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
