/** @jsx jsx */

import { H3, UL } from '@blueprintjs/core';
import { jsx, css } from '@emotion/react';
import { ItemClassConfiguration, ItemDetailView, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import GenericRelatedItemView from '@riboseinc/paneron-registry-kit/views/GenericRelatedItemView';
import {
  DEFAULTS as COMMON_DEFAULTS,
  COMMON_PROPERTIES,
  AliasesDetail,
  ListItemView as CommonListItemView,
  EditView as CommonEditView,
  DetailView as CommonDetailView,
  CommonGRItemData,
} from './common';


interface CoordinateSystemData extends CommonGRItemData {
  aliases: string[]
  coordinateSystemAxes: string[]
}

export const DEFAULTS: CoordinateSystemData = {
  ...COMMON_DEFAULTS,
  aliases: [],
  coordinateSystemAxes: [],
};

const CoordinateSystemDetailView: ItemDetailView<CoordinateSystemData> = function (props) {
  const data = props.itemData;
  const axes = data.coordinateSystemAxes ?? [];

  return (
    <CommonDetailView {...props}>

      {(data.aliases || []).length > 0
        ? <AliasesDetail aliases={data.aliases} />
        : null}

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
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateSystemData>,
    detailView: CoordinateSystemDetailView,
    editView: (props) => (
      <CommonEditView
        useRegisterItemData={props.useRegisterItemData}
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        itemData={props.itemData}
        itemRef={props.itemRef}
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
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateSystemData>,
    detailView: CoordinateSystemDetailView,
    editView: (props) => (
      <CommonEditView
        useRegisterItemData={props.useRegisterItemData}
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        itemData={props.itemData}
        itemRef={props.itemRef}
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
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateSystemData>,
    detailView: CoordinateSystemDetailView,
    editView: (props) => (
      <CommonEditView
        useRegisterItemData={props.useRegisterItemData}
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        itemData={props.itemData}
        itemRef={props.itemRef}
        onChange={props.onChange ? (newData: CommonGRItemData) => {
          if (!props.onChange) { return; }
          props.onChange({ ...props.itemData, ...newData });
        } : undefined} />
    ),
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
