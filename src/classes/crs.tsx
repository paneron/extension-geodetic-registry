/** @jsx jsx */

import { jsx } from '@emotion/core';
import { ItemClassConfiguration, ItemDetailView, ItemListView } from '@riboseinc/paneron-registry-kit/types';

import {
  CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
  COMMON_PROPERTIES,
} from './common';


export interface CRSData extends CommonGRItemData {
  scope: string
}


export const CRS_DEFAULTS = {
  ...SHARED_DEFAULTS,
  scope: '',
}


export const geodeticCRS: ItemClassConfiguration<CRSData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Geodetic CRS",
    description: "Geodetic Coordinate Reference System",
    id: 'crs--geodetic',
    alternativeNames: [],
  },
  defaults: {
    ...CRS_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CRSData>,
    detailView: CommonDetailView as ItemDetailView<CRSData>,
    editView: (props) => (
      <CommonEditView
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        React={props.React}
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


export const verticalCRS: ItemClassConfiguration<CRSData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Vertical CRS",
    description: "Vertical Coordinate Reference System",
    id: 'crs--vertical',
    alternativeNames: [],
  },
  defaults: {
    ...CRS_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CRSData>,
    detailView: CommonDetailView as ItemDetailView<CRSData>,
    editView: (props) => (
      <CommonEditView
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        React={props.React}
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
