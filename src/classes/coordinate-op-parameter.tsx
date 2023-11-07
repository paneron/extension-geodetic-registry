/** @jsx jsx */

import { Button, NumericInput } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { type ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';

import {
  type CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  COMMON_PROPERTIES,
} from './common';


export interface CoordinateParameterData extends CommonGRItemData {
  minimumOccurs: number | null
}

export const DEFAULTS: CoordinateParameterData = {
  ...SHARED_DEFAULTS,
  minimumOccurs: null,
} as const;


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
    editView: (props) => (
      <CommonEditView
          useRegisterItemData={props.useRegisterItemData}
          getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
          itemData={props.itemData}
          itemRef={props.itemRef}
          onChange={props.onChange ? (newData: CommonGRItemData) => {
            if (!props.onChange) { return; }
            props.onChange({ ...props.itemData, ...newData });
          } : undefined}>

        <PropertyDetailView title="Minimum occurrences">
          <NumericInput
            required
            rightElement={<Button
              disabled={!props.onChange}
              icon="cross"
              onClick={() => props.onChange?.({ ...props.itemData, minimumOccurs: null })}
            />}
            value={props.itemData.minimumOccurs ?? ''}
            disabled={!props.onChange}
            onValueChange={(num) => props.onChange?.({ ...props.itemData, minimumOccurs: num })}
          />
        </PropertyDetailView>

      </CommonEditView>
    ),
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};

