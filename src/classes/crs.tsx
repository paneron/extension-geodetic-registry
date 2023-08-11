/** @jsx jsx */

import update from 'immutability-helper';
import { jsx } from '@emotion/react';
import { H5 } from '@blueprintjs/core';
import { type ItemClassConfiguration, ItemDetailView, ItemEditView, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import GenericRelatedItemView from '@riboseinc/paneron-registry-kit/views/GenericRelatedItemView';

import {
  type CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
  type Extent,
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
        itemRef={props.itemRef}
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


export interface CompoundCRSData extends CRSData {
  verticalCRS: { classID: string, itemID: string }
  horizontalCRS: { classID: string, itemID: string }
}
export const COMPOUND_DEFAULTS = {
  horizontal: undefined,
  vertical: undefined
}

export interface ProjectedCRSData extends CRSData {
}
export const PROJECTED_DEFAULTS = {
}


export interface EngineeringCRSData extends CRSData {
  datum: string // engineering
}
export const ENGINEERING_DEFAULTS = {
  datum: ''
}


export interface VerticalCRSData extends CRSData {
  datum: string // vertical
}
export const VERTICAL_DEFAULTS = {
  datum: ''
}



export interface GeodeticCRSData extends CRSData {
  /** Geodetic datum */
  datum: string
}
export const GEODETIC_DEFAULTS = {
  datum: ''
}

export const engineeringCRS: ItemClassConfiguration<EngineeringCRSData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Engineering CRS",
    description: "Engineering Coordinate Reference System",
    id: 'crs--engineering',
    alternativeNames: [],
  },
  defaults: {
    ...CRS_DEFAULTS,
    ...ENGINEERING_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<EngineeringCRSData>,
    detailView: (props) => {
      const data = props.itemData;

      return (
        <CRSDetailView {...props}>

          {data.datum
            ? <PropertyDetailView title="Datum">
                <GenericRelatedItemView
                  itemRef={{ classID: 'datums--engineering', itemID: data.datum }}
                  getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                  useRegisterItemData={props.useRegisterItemData}
                />
              </PropertyDetailView>
            : '—'}

        </CRSDetailView>
      )
    },
    editView: (props) => {
      const EditView = CRSEditView as ItemEditView<EngineeringCRSData>;
      return (
        <EditView {...props}>
          <PropertyDetailView title="Datum (engineering)">
            <GenericRelatedItemView
              itemRef={{ itemID: props.itemData.datum, classID: 'datums--engineering' }}
              availableClassIDs={['datums--engineering']}
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

export const compoundCRS: ItemClassConfiguration<CompoundCRSData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Compound CRS",
    description: "Compound Coordinate Reference System",
    id: 'crs--compound',
    alternativeNames: [],
  },
  defaults: {
    ...CRS_DEFAULTS,
    ...COMPOUND_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CompoundCRSData>,
    detailView: (props) => {
      return (
        <CRSDetailView {...props}>

          {props.itemData.horizontalCRS
            ? <PropertyDetailView title="Horizontal CRS">
                <GenericRelatedItemView
                  itemRef={props.itemData.horizontalCRS}
                  getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                  useRegisterItemData={props.useRegisterItemData}
                />
              </PropertyDetailView>
            : null}

          {props.itemData.verticalCRS
            ? <PropertyDetailView title="Vertical CRS">
                <GenericRelatedItemView
                  itemRef={props.itemData.verticalCRS}
                  getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                  useRegisterItemData={props.useRegisterItemData}
                />
              </PropertyDetailView>
            : null}

        </CRSDetailView>
      )
    },
    editView: (props) => {
      const EditView = CRSEditView as ItemEditView<CompoundCRSData>;
      return (
        <EditView {...props}>
          <PropertyDetailView title="Horizontal CRS">
            <GenericRelatedItemView
              itemRef={props.itemData.horizontalCRS}
              availableClassIDs={['crs--projected', 'crs--engineering', 'crs--geodetic']}
              onClear={props.onChange
                ? () => props.onChange!(update(props.itemData, { $unset: ['horizontalCRS'] }))
                : undefined}
              onChange={props.onChange
                ? (itemRef) => {
                    props.onChange!(update(props.itemData, { horizontalCRS: { $set: itemRef } }))
                  }
                : undefined}
              itemSorter={COMMON_PROPERTIES.itemSorter}
              getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
              useRegisterItemData={props.useRegisterItemData}
            />
          </PropertyDetailView>
          <PropertyDetailView title="Vertical CRS">
            <GenericRelatedItemView
              itemRef={props.itemData.verticalCRS}
              availableClassIDs={['crs--vertical', 'crs--engineering']}
              onClear={props.onChange
                ? () => props.onChange!(update(props.itemData, { $unset: ['verticalCRS'] }))
                : undefined}
              onChange={props.onChange
                ? (itemRef) => {
                    props.onChange!(update(props.itemData, { verticalCRS: { $set: itemRef } }))
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

export const projectedCRS: ItemClassConfiguration<ProjectedCRSData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Projected CRS",
    description: "Projected Coordinate Reference System",
    id: 'crs--projected',
    alternativeNames: [],
  },
  defaults: {
    ...CRS_DEFAULTS,
    ...PROJECTED_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<ProjectedCRSData>,
    detailView: (props) => {
      return (
        <CRSDetailView {...props}>
        </CRSDetailView>
      )
    },
    editView: (props) => {
      const EditView = CRSEditView as ItemEditView<ProjectedCRSData>;
      return (
        <EditView {...props}>
        </EditView>
      );
    },
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};

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
