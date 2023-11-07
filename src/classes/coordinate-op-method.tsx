/** @jsx jsx */

import update from 'immutability-helper';
import { jsx } from '@emotion/react';
import { ControlGroup } from '@blueprintjs/core';
import { type ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';

import {
  type CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  COMMON_PROPERTIES,
  ItemList,
  RelatedItem,
} from './common';


export interface CoordinateOpMethod extends CommonGRItemData {
  parameters: Readonly<string[]>
}

export const DEFAULTS: CoordinateOpMethod = {
  ...SHARED_DEFAULTS,
  parameters: [],
} as const;


export const coordinateOpMethod: ItemClassConfiguration<CoordinateOpMethod> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Coordinate Operation Method",
    description: "Coordinate Operation Method",
    id: 'coordinate-op-method',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateOpMethod>,
    editView: ({ itemRef, itemData, onChange }) => (
      <CommonEditView
          itemData={itemData}
          itemRef={itemRef}
          onChange={onChange ? (newData: CommonGRItemData) => {
            if (!onChange) { return; }
            onChange({ ...itemData, ...newData });
          } : undefined}>

        <ItemList
          items={itemData.parameters}
          simpleItems
          itemLabel="parameter"
          onChangeItems={onChange
            ? (spec) => onChange!(update(itemData, { parameters: spec }))
            : undefined}
          placeholderItem={''}
          itemRenderer={(param, _idx, handleChange, deleteButton) =>
            <ControlGroup>
              <RelatedItem
                itemRef={{ classID: 'coordinate-op-parameter', itemID: param }}
                mode="id"
                classIDs={['coordinate-op-parameter']}
                onClear={onChange
                  ? () => handleChange!({ $set: '' })
                  : undefined}
                onSet={handleChange
                  ? (spec) => handleChange!(spec)
                  : undefined}
              />
              {deleteButton}
            </ControlGroup>
          }
        />
      </CommonEditView>
    ),
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
