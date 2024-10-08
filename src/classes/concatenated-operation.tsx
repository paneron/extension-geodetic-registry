/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';

import React from 'react';
import { jsx } from '@emotion/react';
import { ControlGroup, InputGroup } from '@blueprintjs/core';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import { itemRefToItemPath } from '@riboseinc/paneron-registry-kit/views/itemPathUtils';
//import { BrowserCtx } from '@riboseinc/paneron-registry-kit/views/BrowserCtx';
import type { RegisterItem, InternalItemReference, ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';

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
  ItemList,
  RelatedItem,
  type Accuracy,
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
  extent: Extent
  extentRef?: string
  operationVersion: string
  accuracy: Accuracy

  /** Source CRS must match the first operation’s source CRS. */
  sourceCRS?: InternalItemReference

  /** Target CRS must match the last operation’s target CRS. */
  targetCRS?: InternalItemReference
}


export const concatenatedOperation: ItemClassConfiguration<ConcatenatedOperationData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Concatenated Operation",
    description: "Coordinate Operations — Concatenated Operation",
    id: 'coordinate-ops--concatenated',
    alternativeNames: [] as const,
  },
  defaults: {
    ...SHARED_DEFAULTS,
    operationVersion: '',
    extent: DEFAULT_EXTENT,
    operations: [],
    accuracy: ACCURACY_STUB,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<ConcatenatedOperationData>,

    editView: function ConcatenatedOperationEditView ({ itemData, onChange, ...props }) {
      const operationItemPaths = itemData.operations.map(ref => itemRefToItemPath(ref));
      const operationItemUUIDs = itemData.operations.map(ref => ref.itemID);

      /** Item data for every linked single operation. */
      const operationItemData = (typeof props.useRegisterItemData === 'function'
        ? props.useRegisterItemData({
          itemPaths: operationItemPaths,
        }).value
        : {}
      ) as Record<string, RegisterItem<TransformationData | ConversionData> | null>;
      // NOTE: We cannot obtain the above useRegisterItemData via context, apparently,
      // so we pass it as prop again.

      /**
       * [source, target] CRS item paths for every linked single operation.
       * Operations with either CRS missing are omitted.
       */
      const crsByOperation: Record<string, [string, string]> = React.useMemo(() =>
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
          map(([opID, paths]) =>
            ({ [opID]: [paths[0], paths[1]] as [string, string] })
          ).
          reduce((prev, curr) => ({ ...prev, ...curr }), {}),
        [operationItemData]);

      /**
       * Maps each operation item UUID to custom validation error
       * (empty string if no error).
       */
      const operationValidationErrors: Record<string, string> = React.useMemo(() => {
        const errors: Record<string, string> = {};
        let previousTarget: string | null = null;
        for (const opUUID of operationItemUUIDs.filter(uuid => uuid !== '')) {
          if (crsByOperation[opUUID]) {
            const [currentSource, currentTarget] = crsByOperation[opUUID];
            if (currentSource && currentTarget) {
              if (!previousTarget) {
                previousTarget = currentTarget;
                errors[opUUID] = "";
              } else {
                if (currentSource !== previousTarget) {
                  errors[opUUID] = "Source CRS of this operation does not match target CRS of previous operation";
                } else {
                  errors[opUUID] = "";
                }
              }
            } else {
              errors[opUUID] = "This operation has no target and/or no source CRS specified.";
            }
          } else {
            console.warn("Source/target CRS for operation with UUID were not retrieved:", opUUID);
            errors[opUUID] = "Unable to fetch source/target CRS for this operation.";
          }
        }
        return errors;
      }, [crsByOperation, operationItemUUIDs.toString()]);

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

            <CombinedExtentWidget
              extent={itemData.extent}
              extentRef={itemData.extentRef}
              onRefChange={onChange
                ? (ref) => onChange!(update(itemData, { extentRef: { $set: ref } }))
                : undefined}
            />

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
              minItems={2}
              onChangeItems={onChange
                ? (spec) => onChange!(update(itemData, { operations: spec }))
                : undefined}
              placeholderItem={{ classID: 'coordinate-ops--transformation', itemID: '' }}
              simpleItems
              itemRenderer={(opRef, _idx, handleChange, deleteButton) =>
                <ControlGroup>
                  <RelatedItem
                    itemRef={opRef}
                    fill
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
