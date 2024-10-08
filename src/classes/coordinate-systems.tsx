/** @jsx jsx */

import update from 'immutability-helper';
import { jsx } from '@emotion/react';
import { ControlGroup } from '@blueprintjs/core';
import type { ItemClassConfiguration, ItemEditView, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import {
  DEFAULTS as COMMON_DEFAULTS,
  COMMON_PROPERTIES,
  ListItemView as CommonListItemView,
  EditView as CommonEditView,
  type CommonGRItemData,
  ItemList,
  RelatedItem,
} from './common';


export interface CoordinateSystemData extends CommonGRItemData {
  coordinateSystemAxes: Readonly<string[]>
}

export const DEFAULTS: CoordinateSystemData = {
  ...COMMON_DEFAULTS,
  coordinateSystemAxes: [],
} as const;

const CoordinateSystemEditView: ItemEditView<CoordinateSystemData> =
function ({ itemData, onChange, ...props })  {
  return (
    <CommonEditView
        {...props}
        itemData={itemData}
        onChange={onChange
          ? (newData: CommonGRItemData) => {
              onChange?.({ ...itemData, ...newData });
            }
          : undefined
        }>

      <ItemList
        items={itemData.coordinateSystemAxes}
        simpleItems
        itemLabel="axis"
        onChangeItems={onChange
          ? (spec) => onChange!(update(itemData, { coordinateSystemAxes: spec }))
          : undefined}
        placeholderItem=""
        itemRenderer={(axis, _idx, handleChange, deleteButton) =>
          <ControlGroup fill>
            <RelatedItem
              itemRef={{ classID: 'coordinate-sys-axis', itemID: axis }}
              fill
              classIDs={['coordinate-sys-axis']}
              mode="id"
              onSet={handleChange}
            />
            {deleteButton}
          </ControlGroup>
        }
      />

    </CommonEditView>
  );
}

export const cartesianCoordinateSystem: ItemClassConfiguration<CoordinateSystemData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Cartesian Coordinate System",
    description: "Cartesian Coordinate System",
    id: 'coordinate-sys--cartesian',
    alternativeNames: [] as const,
  },
  defaults: {
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateSystemData>,
    editView: CoordinateSystemEditView,
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};


export const ellipsoidalCoordinateSystem: ItemClassConfiguration<CoordinateSystemData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Ellipsoidal Coordinate System",
    description: "Ellipsoidal Coordinate System",
    id: 'coordinate-sys--ellipsoidal',
    alternativeNames: [] as const,
  },
  defaults: {
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateSystemData>,
    editView: CoordinateSystemEditView,
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
} as const;


export const verticalCoordinateSystem: ItemClassConfiguration<CoordinateSystemData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Vertical Coordinate System",
    description: "Vertical Coordinate System",
    id: 'coordinate-sys--vertical',
    alternativeNames: [] as const,
  },
  defaults: {
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateSystemData>,
    editView: CoordinateSystemEditView,
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
} as const;


export const sphericalCoordinateSystem: ItemClassConfiguration<CoordinateSystemData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Spherical Coordinate System",
    description: "Spherical Coordinate System",
    id: 'coordinate-sys--spherical',
    alternativeNames: [] as const,
  },
  defaults: {
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateSystemData>,
    editView: CoordinateSystemEditView,
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
} as const;
