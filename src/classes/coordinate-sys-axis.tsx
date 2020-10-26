/** @jsx jsx */

import { jsx } from '@emotion/core';

import { ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { GenericRelatedItemView, PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
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
        <CommonDetailView {...props}>

          <PropertyDetailView title="Abbreviation">
            {data.abbreviation || '—'}
          </PropertyDetailView>

          <PropertyDetailView title="Orientation">
            {data.orientation || '—'}
          </PropertyDetailView>

          <PropertyDetailView title="Unit of measurement">
            <GenericRelatedItemView
              React={props.React}
              itemRef={{ classID: 'unit-of-measurement', itemID: data.unitOfMeasurement }}
              getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
              useRegisterItemData={props.useRegisterItemData}
            />
          </PropertyDetailView>

        </CommonDetailView>
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
