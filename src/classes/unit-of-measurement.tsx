/** @jsx jsx */

import { jsx } from '@emotion/core';
import { ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';

import {
  CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
  COMMON_PROPERTIES,
  AliasesDetail,
} from './common';


export interface UoMData extends CommonGRItemData {
  aliases: string[]
  denominator: null | number
  numerator: null | number
  measureType: 'ANGLE' | 'SCALE' | 'LENGTH' | 'TIME'
  symbol: string | null
}

export const DEFAULTS: UoMData = {
  ...SHARED_DEFAULTS,
  measureType: 'LENGTH',
  aliases: [],
  symbol: null,
  denominator: null,
  numerator: null,
};


export const unitOfMeasurement: ItemClassConfiguration<UoMData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Unit",
    description: "Unit of Measurement",
    id: 'unit-of-measurement',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<UoMData>,
    detailView: (props) => {
      const data = props.itemData;

      return (
        <CommonDetailView {...props}>

          <PropertyDetailView inline title="Symbol">
            {data.symbol || '—'}
          </PropertyDetailView>

          {(data.aliases || []).length > 0
            ? <AliasesDetail aliases={data.aliases} />
            : null}

          <PropertyDetailView inline title="Measure type">
            {data.measureType}
          </PropertyDetailView>

          <PropertyDetailView inline title="Denominator">
            {data.denominator?.toString() || '—'}
          </PropertyDetailView>

          <PropertyDetailView inline title="Numerator">
            {data.numerator?.toString() || '—'}
          </PropertyDetailView>

        </CommonDetailView>
      )
    },
    editView: (props) => (
      <CommonEditView
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
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
