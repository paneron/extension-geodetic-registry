/** @jsx jsx */

import { jsx } from '@emotion/core';
import { ItemClassConfiguration, ItemDetailView, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { GenericRelatedItemView, PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';

import {
  CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
  COMMON_PROPERTIES,
  Extent,
  DEFAULT_EXTENT,
  ExtentEdit,
  AliasesDetail,
} from './common';


export interface DatumData extends CommonGRItemData {
  scope: string
  aliases: string[]
  extent: Extent
  originDescription: string
  coordinateReferenceEpoch: string | null
  releaseDate: string
}

export const DATUM_DEFAULTS: DatumData = {
  ...SHARED_DEFAULTS,
  aliases: [],
  scope: '',
  extent: DEFAULT_EXTENT,
  originDescription: '',
  releaseDate: '',
  coordinateReferenceEpoch: null,
};

const DatumDetailView: ItemDetailView<DatumData> = function (props) {
  const data = props.itemData;

  return (
    <CommonDetailView {...props}>
      {props.children}

      {(data.aliases || []).length > 0
        ? <AliasesDetail aliases={data.aliases} />
        : null}

      <PropertyDetailView inline title="Scope">
        {data.scope || ''}
      </PropertyDetailView>

      <PropertyDetailView inline title="Coordinate reference epoch">
        {data.coordinateReferenceEpoch || ''}
      </PropertyDetailView>

      <PropertyDetailView title="Extent">
        {data.extent ? <ExtentEdit extent={data.extent} /> : '—'}
      </PropertyDetailView>

      <PropertyDetailView title="Origin description">
        {data.originDescription || ''}
      </PropertyDetailView>

      <PropertyDetailView title="Release date">
        {data.releaseDate || ''}
      </PropertyDetailView>

    </CommonDetailView>
  );
};


interface GeodeticDatumData extends DatumData {
  ellipsoid: string
  primeMeridian: string
}


export const geodeticDatum: ItemClassConfiguration<GeodeticDatumData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Geodetic Datum",
    description: "Geodetic Reference Frame",
    id: 'datums--geodetic',
    alternativeNames: [],
  },
  defaults: {
    ...DATUM_DEFAULTS,
    ellipsoid: '',
    primeMeridian: '',
  },
  views: {
    listItemView: CommonListItemView as ItemListView<GeodeticDatumData>,
    detailView: (props) => {
      const data = props.itemData;

      return (
        <DatumDetailView {...props}>

          {data.ellipsoid
            ? <PropertyDetailView title="Ellipsoid">
                <GenericRelatedItemView
                  itemRef={{ classID: 'ellipsoid', itemID: data.ellipsoid }}
                  getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                  useRegisterItemData={props.useRegisterItemData}
                />
              </PropertyDetailView>
            : '—'}

          {data.primeMeridian
            ? <PropertyDetailView title="Prime meridian">
                <GenericRelatedItemView
                  itemRef={{ classID: 'prime-meridian', itemID: data.primeMeridian }}
                  getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                  useRegisterItemData={props.useRegisterItemData}
                />
              </PropertyDetailView>
            : '—'}

        </DatumDetailView>
      )
    },
    editView: (props) => (
      <CommonEditView
        useRegisterItemData={props.useRegisterItemData}
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


export const verticalDatum: ItemClassConfiguration<DatumData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Vertical Datum",
    description: "Vertical Reference Frame",
    id: 'datums--vertical',
    alternativeNames: [],
  },
  defaults: {
    ...DATUM_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<DatumData>,
    detailView: DatumDetailView as ItemDetailView<DatumData>,
    editView: (props) => (
      <CommonEditView
        useRegisterItemData={props.useRegisterItemData}
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
