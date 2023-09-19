/** @jsx jsx */

import { NumericInput } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { type ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';

import {
  CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
  COMMON_PROPERTIES,
} from './common';


export interface CoordinateParameterData extends CommonGRItemData {
  minimumOccurs: number | null
}

export const DEFAULTS: CoordinateParameterData = {
  ...SHARED_DEFAULTS,
  minimumOccurs: null,
};


export const coordinateOpParameter: ItemClassConfiguration<CoordinateParameterData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Coordinate Operation Parameter",
    description: "Coordinate Operation Parameter",
    id: 'coordinate-op-parameter',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateParameterData>,
    detailView: (props) => {
      const data = props.itemData;

      return (
        <CommonDetailView {...props}>

          {data.minimumOccurs !== null
            ? <PropertyDetailView title="Minimum occurrences">
                <NumericInput readOnly value={data.minimumOccurs} />
              </PropertyDetailView>
            : null}

        </CommonDetailView>
      )
    },
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

