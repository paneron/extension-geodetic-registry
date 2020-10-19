/** @jsx jsx */

import { H5 } from '@blueprintjs/core';
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
} from './common';


export interface CRSData extends CommonGRItemData {
  scope: string
  coordinateSystem?: { classID: string, itemID: string }
}

export const CRS_DEFAULTS: CRSData = {
  ...SHARED_DEFAULTS,
  scope: '',
}

const CommonCRSDetailView: ItemDetailView<CRSData> = function (props) {
  const data = props.itemData;

  const GenericRelatedItemView = styled(props.GenericRelatedItemView)`
    margin-bottom: 1rem;
  `;

  return (
    <props.React.Fragment>

      <H5>Coordinate system</H5>
      {data.coordinateSystem
        ? <GenericRelatedItemView
            React={props.React}
            itemRef={data.coordinateSystem}
            getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
            useRegisterItemData={props.useRegisterItemData}
          />
        : '—'}

      <CommonDetailView {...props} />

    </props.React.Fragment>
  );
};


interface VerticalCRSData extends CRSData {
  datum: string // vertical
}
export const VERTICAL_DEFAULTS = {
  datum: ''
}



interface GeodeticCRSData extends CRSData {
  datum: string // geodetic
}
export const GEODETIC_DEFAULTS = {
  datum: ''
}


export const geodeticCRS: ItemClassConfiguration<GeodeticCRSData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Geodetic CRS",
    description: "Geodetic Coordinate Reference System",
    id: 'crs--geodetic',
    alternativeNames: [],
  },
  defaults: {
    ...CRS_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<GeodeticCRSData>,
    detailView: (props) => {
      const data = props.itemData;
      const GenericRelatedItemView = styled(props.GenericRelatedItemView)`
        margin-bottom: 1rem;
      `;

      return (
        <props.React.Fragment>

          <H5>Datum</H5>
          {data.datum
            ? <GenericRelatedItemView
                React={props.React}
                itemRef={{ classID: 'datums--geodetic', itemID: data.datum }}
                getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                useRegisterItemData={props.useRegisterItemData}
              />
            : '—'}

          <CommonCRSDetailView {...props} />

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


export const verticalCRS: ItemClassConfiguration<VerticalCRSData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Vertical CRS",
    description: "Vertical Coordinate Reference System",
    id: 'crs--vertical',
    alternativeNames: [],
  },
  defaults: {
    ...CRS_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<VerticalCRSData>,
    detailView: (props) => {
      const data = props.itemData;
      const GenericRelatedItemView = styled(props.GenericRelatedItemView)`
        margin-bottom: 1rem;
      `;

      return (
        <props.React.Fragment>

          <H5>Datum</H5>
          {data.datum
            ? <GenericRelatedItemView
                React={props.React}
                itemRef={{ classID: 'datums--vertical', itemID: data.datum }}
                getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                useRegisterItemData={props.useRegisterItemData}
              />
            : '—'}

          <CommonCRSDetailView {...props} />

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
