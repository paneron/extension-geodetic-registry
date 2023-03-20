/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';

import { jsx } from '@emotion/react';

import { ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import GenericRelatedItemView from '@riboseinc/paneron-registry-kit/views/GenericRelatedItemView';
import {
  CommonGRItemData,
  COMMON_PROPERTIES,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
} from './common';


interface CoordinateSystemAxisData extends CommonGRItemData {
  abbreviation: string
  orientation: string
  unitOfMeasurement: string
}


export const coordinateSystemAxis: ItemClassConfiguration<CoordinateSystemAxisData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Coordinate System Axis",
    description: "Coordinate System Axis",
    id: 'coordinate-sys-axis',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
    abbreviation: '',
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateSystemAxisData>,

    detailView: (props) => {
      const data = props.itemData;

      return (
        <CommonDetailView {...props}>

          <PropertyDetailView title="Abbreviation">
            {data.abbreviation || '—'}
          </PropertyDetailView>

          <PropertyDetailView title="Orientation">
            {data.orientation || '—'}
          </PropertyDetailView>

          <PropertyDetailView title="Unit of measurement">
            <GenericRelatedItemView
              itemRef={{ classID: 'unit-of-measurement', itemID: data.unitOfMeasurement }}
              getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
              useRegisterItemData={props.useRegisterItemData}
            />
          </PropertyDetailView>

        </CommonDetailView>
      );
    },

    editView: (props) => <>
      <CommonEditView
        useRegisterItemData={props.useRegisterItemData}
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        itemData={props.itemData}
        itemRef={props.itemRef}
        onChange={props.onChange ? (newData: CommonGRItemData) => {
          if (!props.onChange) { return; }
          props.onChange({ ...props.itemData, ...newData });
        } : undefined} />
    </>,
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
