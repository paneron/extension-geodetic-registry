/** @jsx jsx */

import { H3, UL } from '@blueprintjs/core';
import { jsx, css } from '@emotion/core';
import { ItemClassConfiguration, ItemDetailView, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import GenericRelatedItemView from '@riboseinc/paneron-registry-kit/views/GenericRelatedItemView';
import {
  DEFAULTS as COMMON_DEFAULTS,
  COMMON_PROPERTIES,
  ListItemView as CommonListItemView,
  EditView as CommonEditView,
  DetailView as CommonDetailView,
  CommonGRItemData,
} from './common';


interface CoordinateSystemData extends CommonGRItemData {
  coordinateSystemAxes: string[]
}


const CoordinateSystemDetailView: ItemDetailView<CoordinateSystemData> = function (props) {
  const data = props.itemData;
  const axes = data.coordinateSystemAxes ?? [];

  return (
    <CommonDetailView {...props}>
      <H3>Axes</H3>

      <UL css={css`padding-left: 0; list-style: square;`}>
        {axes.map((axis, idx) =>
          <li key={idx} css={css`margin-top: 1em;`}>
            <PropertyDetailView title={`Axis ${idx + 1}`}>
              <GenericRelatedItemView
                itemRef={{ classID: 'coordinate-sys-axis', itemID: axis }}
                getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                useRegisterItemData={props.useRegisterItemData}
              />
            </PropertyDetailView>
          </li>
        )}
      </UL>
    </CommonDetailView>
  );
};


export const cartesianCoordinateSystem: ItemClassConfiguration<CoordinateSystemData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Cartesian Coordinate System",
    description: "Cartesian Coordinate System",
    id: 'coordinate-sys--cartesian',
    alternativeNames: [],
  },
  defaults: {
    ...COMMON_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateSystemData>,
    detailView: CoordinateSystemDetailView,
    editView: (props) => (
      <CommonEditView
        useRegisterItemData={props.useRegisterItemData}
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        itemData={props.itemData}
        onChange={props.onChange ? (newData: CommonGRItemData) => {
          if (!props.onChange) { return; }
          props.onChange({ ...props.itemData, ...newData });
        } : undefined} />
    ),
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
    ...COMMON_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateSystemData>,
    detailView: CoordinateSystemDetailView,
    editView: (props) => (
      <CommonEditView
        useRegisterItemData={props.useRegisterItemData}
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        itemData={props.itemData}
        onChange={props.onChange ? (newData: CommonGRItemData) => {
          if (!props.onChange) { return; }
          props.onChange({ ...props.itemData, ...newData });
        } : undefined} />
    ),
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
    ...COMMON_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateSystemData>,
    detailView: CoordinateSystemDetailView,
    editView: (props) => (
      <CommonEditView
        useRegisterItemData={props.useRegisterItemData}
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        itemData={props.itemData}
        onChange={props.onChange ? (newData: CommonGRItemData) => {
          if (!props.onChange) { return; }
          props.onChange({ ...props.itemData, ...newData });
        } : undefined} />
    ),
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
