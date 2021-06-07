/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';

import { ControlGroup, InputGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/core';

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


interface PrimeMeridianData extends CommonGRItemData {
  longitudeFromGreenwich: number
  longitudeFromGreenwichUoM: string
}


export const primeMeridian: ItemClassConfiguration<PrimeMeridianData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Prime Meridian",
    description: "Prime Meridian",
    id: 'prime-meridian',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
    longitudeFromGreenwich: 0,
    longitudeFromGreenwichUoM: '',
  },
  views: {
    listItemView: CommonListItemView as ItemListView<PrimeMeridianData>,

    detailView: (props) => {
      const data = props.itemData;

      return (
        <CommonDetailView {...props}>
          <PropertyDetailView title="Longitude from Greenwich">
            <ControlGroup fill>
              <InputGroup readOnly value={data.longitudeFromGreenwich.toString()} />
              <GenericRelatedItemView
                itemRef={{ classID: 'unit-of-measurement', itemID: data.longitudeFromGreenwichUoM }}
                getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                useRegisterItemData={props.useRegisterItemData}
              />
            </ControlGroup>
          </PropertyDetailView>
        </CommonDetailView>
      );
    },

    editView: (props) => <>
      <CommonEditView
        useRegisterItemData={props.useRegisterItemData}
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        itemData={props.itemData}
        onChange={props.onChange ? (newData: CommonGRItemData) => {
          if (!props.onChange) { return; }
          props.onChange({ ...props.itemData, ...newData });
        } : undefined} />
    </>,
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
