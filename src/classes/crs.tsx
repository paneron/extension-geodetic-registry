/** @jsx jsx */

import update from 'immutability-helper';
import { jsx } from '@emotion/react';
import { H5 } from '@blueprintjs/core';
import { ItemClassConfiguration, ItemDetailView, ItemEditView, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import GenericRelatedItemView from '@riboseinc/paneron-registry-kit/views/GenericRelatedItemView';

import {
  CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
  Extent,
  DEFAULT_EXTENT,
  ExtentEdit,
  COMMON_PROPERTIES,
} from './common';


export interface CRSData extends CommonGRItemData {
  scope: string
  extent: Extent
  coordinateSystem?: { classID: string, itemID: string }
}

export const CRS_DEFAULTS: CRSData = {
  ...SHARED_DEFAULTS,
  extent: DEFAULT_EXTENT,
  scope: '',
}

const CRSDetailView: ItemDetailView<CRSData> = function (props) {
  const data = props.itemData;

  return (
    <CommonDetailView {...props}>
      <PropertyDetailView title="Extent">
        {data.extent ? <ExtentEdit extent={data.extent} /> : '—'}
      </PropertyDetailView>

      {props.children}

      <H5>Coordinate system</H5>
      {data.coordinateSystem
        ? <GenericRelatedItemView
            itemRef={data.coordinateSystem}
            getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
            useRegisterItemData={props.useRegisterItemData}
          />
        : '—'}

    </CommonDetailView>
  );
};


const CRSEditView: ItemEditView<CRSData> = function (props) {
  return (
    <CommonEditView
        useRegisterItemData={props.useRegisterItemData}
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        itemData={props.itemData}
        onChange={props.onChange ? (newData: CommonGRItemData) => {
          if (!props.onChange) { return; }
          props.onChange({ ...props.itemData, ...newData });
        } : undefined}>

      <PropertyDetailView title="Extent">
        <ExtentEdit
          extent={props.itemData.extent ?? DEFAULT_EXTENT}
          onChange={props.onChange
            ? (extent) => props.onChange!(update(props.itemData, { extent: { $set: extent } }))
            : undefined}
        />
      </PropertyDetailView>

      {props.children}

      <PropertyDetailView title="Coordinate system">
        <GenericRelatedItemView
          itemRef={props.itemData.coordinateSystem}
          availableClassIDs={['coordinate-sys--cartesian', 'coordinate-sys--ellipsoidal', 'coordinate-sys--vertical']}
          onClear={props.onChange
            ? () => props.onChange!(update(props.itemData, { $unset: ['coordinateSystem'] }))
            : undefined}
          onChange={props.onChange
            ? (itemRef) => {
                props.onChange!(update(props.itemData, { coordinateSystem: { $set: itemRef } }))
              }
            : undefined}
          itemSorter={COMMON_PROPERTIES.itemSorter}
          getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
          useRegisterItemData={props.useRegisterItemData}
        />
      </PropertyDetailView>

    </CommonEditView>
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
    ...GEODETIC_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<GeodeticCRSData>,
    detailView: (props) => {
      const data = props.itemData;

      return (
        <CRSDetailView {...props}>

          {data.datum
            ? <PropertyDetailView title="Datum">
                <GenericRelatedItemView
                  itemRef={{ classID: 'datums--geodetic', itemID: data.datum }}
                  getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                  useRegisterItemData={props.useRegisterItemData}
                />
              </PropertyDetailView>
            : '—'}

        </CRSDetailView>
      )
    },
    editView: (props) => {
      const EditView = CRSEditView as ItemEditView<GeodeticCRSData>;
      return (
        <EditView {...props}>
          <PropertyDetailView title="Datum (geodetic)">
            <GenericRelatedItemView
              itemRef={{ itemID: props.itemData.datum, classID: 'datums--geodetic' }}
              availableClassIDs={['datums--geodetic']}
              onClear={props.onChange
                ? () => props.onChange!(update(props.itemData, { $unset: ['datum'] }))
                : undefined}
              onChange={props.onChange
                ? (itemRef) => {
                    props.onChange!(update(props.itemData, { datum: { $set: itemRef.itemID } }))
                  }
                : undefined}
              itemSorter={COMMON_PROPERTIES.itemSorter}
              getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
              useRegisterItemData={props.useRegisterItemData}
            />
          </PropertyDetailView>
        </EditView>
      );
    },
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
    ...VERTICAL_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<VerticalCRSData>,
    detailView: (props) => {
      const data = props.itemData;

      return (
        <CRSDetailView {...props}>

          {data.datum
            ? <PropertyDetailView title="Datum">
                <GenericRelatedItemView
                  itemRef={{ classID: 'datums--vertical', itemID: data.datum }}
                  getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                  useRegisterItemData={props.useRegisterItemData}
                />
              </PropertyDetailView>
            : '—'}

        </CRSDetailView>
      )
    },
    editView: (props) => {
      const EditView = CRSEditView as ItemEditView<VerticalCRSData>;
      return (
        <EditView {...props}>
          <PropertyDetailView title="Datum (vertical)">
            <GenericRelatedItemView
              itemRef={{ itemID: props.itemData.datum, classID: 'datums--vertical' }}
              availableClassIDs={['datums--vertical']}
              onClear={props.onChange
                ? () => props.onChange!(update(props.itemData, { $unset: ['datum'] }))
                : undefined}
              onChange={props.onChange
                ? (itemRef) => {
                    props.onChange!(update(props.itemData, { datum: { $set: itemRef.itemID } }))
                  }
                : undefined}
              itemSorter={COMMON_PROPERTIES.itemSorter}
              getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
              useRegisterItemData={props.useRegisterItemData}
            />
          </PropertyDetailView>
        </EditView>
      );
    },
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
