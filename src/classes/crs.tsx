/** @jsx jsx */

import update from 'immutability-helper';
import { jsx } from '@emotion/react';
import type {
  ItemClassConfiguration,
  ItemDetailView,
  ItemEditView,
  ItemListView,
} from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import GenericRelatedItemView from '@riboseinc/paneron-registry-kit/views/GenericRelatedItemView';

import {
  type CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  COMMON_PROPERTIES,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
  type Extent,
  DEFAULT_EXTENT,
  ExtentEdit,
  RelatedField,
} from './common';


// Shared
// ======

export interface CRSData extends CommonGRItemData {
  scope: string
  extent: Extent
}

export const CRS_DEFAULTS: CRSData = {
  ...SHARED_DEFAULTS,
  extent: DEFAULT_EXTENT,
  scope: '',
};

const CRSDetailView: ItemDetailView<CRSData> = function (props) {
  const data = props.itemData;

  return (
    <CommonDetailView {...props}>
      <PropertyDetailView title="Extent">
        {data.extent ? <ExtentEdit extent={data.extent} /> : '—'}
      </PropertyDetailView>

      {props.children}

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

    </CommonEditView>
  );
};


// Shared for non-compound
// =======================

export interface NonCompoundCRSData extends CRSData {
  coordinateSystem?: {
    /** Ellipsoidal, spherical, vertical, cartesian */
    classID: string
    itemID: string
  }
  baseCRS?: {
    /** TODO: Which types are possible? */
    classID: string
    itemID: string
  }
  operation?: {
    /** Transformation or Conversion */
    classID: string
    itemID: string
  }
}

export const NON_COMPOUND_CRS_DEFAULTS: CRSData = {
  ...SHARED_DEFAULTS,
  extent: DEFAULT_EXTENT,
  scope: '',
}

const NonCompoundCRSEditView: ItemEditView<NonCompoundCRSData> = function (props) {
  return (
    <CRSEditView
        useRegisterItemData={props.useRegisterItemData}
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        itemData={props.itemData}
        itemRef={props.itemRef}
        onChange={props.onChange ? (newData: CommonGRItemData) => {
          if (!props.onChange) { return; }
          props.onChange({ ...props.itemData, ...newData });
        } : undefined}>

      <PropertyDetailView title="Coordinate system">
        <RelatedField
          fieldName="coordinateSystem"
          allowedClasses={[
            'coordinate-sys--cartesian',
            'coordinate-sys--vertical',
            'coordinate-sys--ellipsoidal',
            'coordinate-sys--spherical',
          ]}
          {...props}
        />
      </PropertyDetailView>

      {props.children}

    </CRSEditView>
  );
};


// Concrete classes
// ================

export interface CompoundCRSData extends CRSData {
  verticalCRS: { classID: string, itemID: string }
  horizontalCRS: { classID: string, itemID: string }
}

export const COMPOUND_DEFAULTS = {
  horizontal: undefined,
  vertical: undefined,
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
            <RelatedField
              fieldName="horizontalCRS"
              allowedClasses={[
                'crs--projected',
                'crs--engineering',
                'crs--geodetic',
              ]}
              {...props}
            />
          </PropertyDetailView>
          <PropertyDetailView title="Vertical CRS">
            <RelatedField
              fieldName="verticalCRS"
              allowedClasses={[
                'crs--vertical',
                'crs--engineering',
              ]}
              {...props}
            />
          </PropertyDetailView>
        </EditView>
      );
    },
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};


export interface ProjectedCRSData extends NonCompoundCRSData {
}

export const PROJECTED_DEFAULTS = {
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
    editView: NonCompoundCRSEditView,
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};


export interface VerticalCRSData extends NonCompoundCRSData {
  datum: string // vertical
}

export const VERTICAL_DEFAULTS = {
  datum: '',
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
    editView: (props) => {
      const EditView = NonCompoundCRSEditView as ItemEditView<VerticalCRSData>;
      return (
        <EditView {...props}>
          <PropertyDetailView title="Datum (vertical)">
            <RelatedField
              fieldName="datum"
              relatedClassID="datums--vertical"
              {...props}
            />
          </PropertyDetailView>
        </EditView>
      );
    },
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};


export interface GeodeticCRSData extends NonCompoundCRSData {
  /** Geodetic datum */
  datum: string
}

export const GEODETIC_DEFAULTS = {
  datum: '',
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
    editView: (props) => {
      const EditView = NonCompoundCRSEditView as ItemEditView<GeodeticCRSData>;
      return (
        <EditView {...props}>
          <PropertyDetailView title="Datum (geodetic)">
            <RelatedField
              fieldName="datum"
              relatedClassID="datums--geodetic"
              {...props}
            />
          </PropertyDetailView>
        </EditView>
      );
    },
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};


export interface EngineeringCRSData extends NonCompoundCRSData {
  datum: string // engineering
}

export const ENGINEERING_DEFAULTS = {
  datum: '',
};

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
    editView: (props) => {
      const EditView = NonCompoundCRSEditView as ItemEditView<EngineeringCRSData>;
      return (
        <EditView {...props}>
          <PropertyDetailView title="Datum (engineering)">
            <RelatedField
              fieldName="datum"
              relatedClassID="datums--engineering"
              {...props}
            />
          </PropertyDetailView>
        </EditView>
      );
    },
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
