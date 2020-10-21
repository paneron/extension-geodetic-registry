/** @jsx jsx */

import { ControlGroup, InputGroup } from '@blueprintjs/core';
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


interface PrimeMeridianData extends CommonGRItemData {
  longitudeFromGreenwich: number
  longitudeFromGreenwichUoM: string
}


export const primeMeridian: ItemClassConfiguration<PrimeMeridianData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Prime meridian",
    description: "Prime meridian",
    id: 'prime-meridian',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
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
                React={props.React}
                itemRef={{ classID: 'unit-of-measurement', itemID: data.longitudeFromGreenwichUoM }}
                getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                useRegisterItemData={props.useRegisterItemData}
              />
            </ControlGroup>
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
