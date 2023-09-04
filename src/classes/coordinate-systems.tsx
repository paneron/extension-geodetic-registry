/** @jsx jsx */

import update from 'immutability-helper';
import { Button, H3 } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import type { ItemClassConfiguration, ItemEditView, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import {
  DEFAULTS as COMMON_DEFAULTS,
  COMMON_PROPERTIES,
  ListItemView as CommonListItemView,
  EditView as CommonEditView,
  type CommonGRItemData,
  ItemList,
  RelatedItem,
} from './common';


interface CoordinateSystemData extends CommonGRItemData {
  coordinateSystemAxes: string[]
}

export const DEFAULTS: CoordinateSystemData = {
  ...COMMON_DEFAULTS,
  coordinateSystemAxes: [],
};

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

      {itemData.coordinateSystemAxes
        ? <H3>Axes</H3>
        : null}

      <ItemList
        items={itemData.coordinateSystemAxes}
        itemLabel="axis"
        onChangeItems={onChange
          ? (spec) => onChange!(update(itemData, { coordinateSystemAxes: spec }))
          : undefined}
        placeholderItem=""
        itemRenderer={(axis, idx, handleChange, deleteButton) =>
          <PropertyDetailView
              title={`Axis ${idx + 1}`}
              secondaryTitle={deleteButton}>
            <RelatedItem
              itemRef={{ classID: 'coordinate-sys-axis', itemID: axis }}
              classIDs={['coordinate-sys-axis']}
              mode="id"
              onSet={onChange
                ? (spec) => onChange!(update(itemData, { coordinateSystemAxes: { [idx]: spec } }))
                : undefined}
            />
          </PropertyDetailView>
        }
      />
      {onChange
        ? <Button icon='add' onClick={() => onChange!(update(
            itemData,
            { coordinateSystemAxes: { $push: [''] } },
          ))}>
            Append axis
          </Button>
        : undefined}
    </CommonEditView>
  );
}

export const cartesianCoordinateSystem: ItemClassConfiguration<CoordinateSystemData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Cartesian Coordinate System",
    description: "Cartesian Coordinate System",
    id: 'coordinate-sys--cartesian',
    alternativeNames: [],
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
    alternativeNames: [],
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


export const verticalCoordinateSystem: ItemClassConfiguration<CoordinateSystemData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Vertical Coordinate System",
    description: "Vertical Coordinate System",
    id: 'coordinate-sys--vertical',
    alternativeNames: [],
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


export const sphericalCoordinateSystem: ItemClassConfiguration<CoordinateSystemData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Spherical Coordinate System",
    description: "Spherical Coordinate System",
    id: 'coordinate-sys--spherical',
    alternativeNames: [],
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
