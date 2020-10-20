/** @jsx jsx */

import { jsx } from '@emotion/core';

import { ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import {
  CommonGRItemData,
  COMMON_PROPERTIES,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
  PropertyDetail,
} from './common';


interface CoordinateSystemAxisData extends CommonGRItemData {
  abbreviation: string
  direction: string
  unit: string
}


export const coordinateSystemAxis: ItemClassConfiguration<CoordinateSystemAxisData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Coordinate system axis",
    description: "Coordinate system axis",
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
        <props.React.Fragment>

          <PropertyDetail title="Abbreviation">
            <p>{data.abbreviation || '—'}</p>
          </PropertyDetail>

          <PropertyDetail title="Direction">
            <p>{data.direction || '—'}</p>
          </PropertyDetail>

          <PropertyDetail title="Unit of measurement">
            <props.GenericRelatedItemView
              React={props.React}
              itemRef={{ classID: 'unit-of-measurement', itemID: data.unit }}
              getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
              useRegisterItemData={props.useRegisterItemData}
            />
          </PropertyDetail>

          <CommonDetailView {...props} />

        </props.React.Fragment>
      );
    },

    editView: (props) => <props.React.Fragment>
      <CommonEditView
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        React={props.React}
        itemData={props.itemData}
        onChange={props.onChange ? (newData: CommonGRItemData) => {
          if (!props.onChange) { return; }
          props.onChange({ ...props.itemData, ...newData });
        } : undefined} />
    </props.React.Fragment>,
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
