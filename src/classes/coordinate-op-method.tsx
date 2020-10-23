/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import { ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { GenericRelatedItemView, PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';

import {
  CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
  COMMON_PROPERTIES,
  AliasesDetail,
} from './common';


export interface CoordinateOpMethod extends CommonGRItemData {
  aliases: string[]
  parameters: string[]
}

export const DEFAULTS: CoordinateOpMethod = {
  ...SHARED_DEFAULTS,
  aliases: [],
  parameters: [],
};


export const coordinateOpMethod: ItemClassConfiguration<CoordinateOpMethod> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Coordinate Operation Method",
    description: "Coordinate Operation Method",
    id: 'coordinate-op-method',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateOpMethod>,
    detailView: (props) => {
      const data = props.itemData;

      return (
        <CommonDetailView {...props}>

          {(data.aliases || []).length > 0
            ? <AliasesDetail aliases={data.aliases} />
            : null}

          {(data.parameters || []).length > 0
            ? <PropertyDetailView title="Parameters">
                {data.parameters.map(paramID =>
                  <GenericRelatedItemView
                    React={props.React}
                    css={css`margin-bottom: 1em;`}
                    getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                    itemRef={{ classID: 'coordinate-op-parameter', itemID: paramID }}
                    useRegisterItemData={props.useRegisterItemData}
                  />
                )}
              </PropertyDetailView>
            : null}

        </CommonDetailView>
      )
    },
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
