/** @jsx jsx */

import { jsx } from '@emotion/core';
import { ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';

import {
  CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
  COMMON_PROPERTIES,
  AliasesDetail,
  PropertyDetail,
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
    title: "Unit of measurement",
    description: "Unit of measurement",
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
        <props.React.Fragment>

          <PropertyDetail title="Symbol">
            <p>{data.symbol || '—'}</p>
          </PropertyDetail>

          {(data.aliases || []).length > 0
            ? <AliasesDetail aliases={data.aliases} />
            : null}

          <PropertyDetail title="Measure type">
            <p>{data.measureType}</p>
          </PropertyDetail>

          <PropertyDetail title="Denominator">
            <p>{data.denominator?.toString() || '—'}</p>
          </PropertyDetail>

          <PropertyDetail title="Numerator">
            <p>{data.numerator?.toString() || '—'}</p>
          </PropertyDetail>

          <CommonDetailView {...props} />

        </props.React.Fragment>
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
