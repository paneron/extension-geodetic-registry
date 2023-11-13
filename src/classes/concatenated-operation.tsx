/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';

import React from 'react';
import { jsx } from '@emotion/react';
import { ControlGroup, InputGroup } from '@blueprintjs/core';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import type { InternalItemReference, ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';

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

    editView: ({ itemData, onChange, ...props }) => {

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
              itemLabelPlural="opperations"
              onChangeItems={onChange
                ? (spec) => onChange!(update(itemData, { operations: spec }))
                : undefined}
              placeholderItem={{ classID: 'coordinate-ops--transformation', itemID: '' }}
              simpleItems
              itemRenderer={(opRef, _idx, handleChange, deleteButton) =>
                <ControlGroup>
                  <RelatedItem
                    itemRef={opRef}
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
