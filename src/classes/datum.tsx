/** @jsx jsx */

import { H5, UL } from '@blueprintjs/core';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { ItemClassConfiguration, ItemDetailView, ItemListView } from '@riboseinc/paneron-registry-kit/types';

import {
  CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
  COMMON_PROPERTIES,
  Extent,
  DEFAULT_EXTENT,
  ExtentDetail,
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
    <props.React.Fragment>

      {(data.aliases || []).length > 0
        ? <props.React.Fragment>
            <H5>Aliases</H5>
            <UL>
              {data.aliases.map((a, idx) => <li key={idx}>{a}</li>)}
            </UL>
          </props.React.Fragment>
        : null}

      <H5>Scope</H5>
      <p>{data.scope || ''}</p>

      <H5>Coordinate reference epoch</H5>
      <p>{data.coordinateReferenceEpoch || '—'}</p>

      <H5>Extent</H5>
      {data.extent ? <p><ExtentDetail extent={data.extent} /></p> : null}

      <H5>Origin description</H5>
      <p>{data.originDescription || ''}</p>

      <H5>Release date</H5>
      <p>{data.releaseDate || ''}</p>

    </props.React.Fragment>
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

      const GenericRelatedItemView = styled(props.GenericRelatedItemView)`
        margin-bottom: 1rem;
      `;

      return (
        <props.React.Fragment>

          <DatumDetailView {...props} />

          <H5>Ellipsoid</H5>
          {data.ellipsoid
            ? <GenericRelatedItemView
                React={props.React}
                itemRef={{ classID: 'ellipsoid', itemID: data.ellipsoid }}
                getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                useRegisterItemData={props.useRegisterItemData}
              />
            : '—'}

          <H5>Prime meridian</H5>
          {data.primeMeridian
            ? <GenericRelatedItemView
                React={props.React}
                itemRef={{ classID: 'prime-meridian', itemID: data.primeMeridian }}
                getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                useRegisterItemData={props.useRegisterItemData}
              />
            : '—'}

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
