/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';
import React from 'react';
import { jsx } from '@emotion/react';
import { TextArea, InputGroup } from '@blueprintjs/core';
import type { ItemClassConfiguration, ItemEditView, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';

import {
  type Extent,
  CombinedExtentWidget,
  DEFAULT_EXTENT,
} from './extent';
import {
  type CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  COMMON_PROPERTIES,
  RelatedItem,
} from './common';


export interface DatumData extends CommonGRItemData {
  scope: string
  extent: Extent

  /** UUID of relevant Extent item. */
  extentRef?: string

  /** A.k.a. “anchor”. */
  originDescription: string

  coordinateReferenceEpoch: string | null
  releaseDate: string
}

export const DATUM_DEFAULTS: DatumData = {
  ...SHARED_DEFAULTS,
  scope: '',
  extent: DEFAULT_EXTENT,
  originDescription: '',
  releaseDate: '',
  coordinateReferenceEpoch: null,
} as const;


const DatumEditView: ItemEditView<DatumData> = function (props) {
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

      {props.children}

      {/* TODO: We need to move anchor definition before remarks */}

      <PropertyDetailView
          title="Anchor definition"
          subLabel="A description, possibly including coordinates of an identified point. Also known as “origin description”.">
        <TextArea
          fill
          required
          value={props.itemData.originDescription ?? ''}
          readOnly={!props.onChange}
          onChange={evt => props.onChange!({
            ...props.itemData,
            originDescription: evt.currentTarget.value,
          })}
        />
      </PropertyDetailView>

      <PropertyDetailView
          title="Scope"
          subLabel="Description of usage, or limitations of usage.">
        <InputGroup
          fill
          required
          value={props.itemData.scope ?? ''}
          readOnly={!props.onChange}
          onChange={evt => props.onChange!({
            ...props.itemData,
            scope: evt.currentTarget.value,
          })}
        />
      </PropertyDetailView>

      <PropertyDetailView
          title="Publication Date"
          helperText={props.onChange
            ? <><code>yyyy</code> or <code>yyyy-mm-dd</code></>
            : undefined}>
        <InputGroup
          fill
          required
          value={props.itemData.releaseDate ?? ''}
          readOnly={!props.onChange}
          onChange={evt => props.onChange!({
            ...props.itemData,
            releaseDate: evt.currentTarget.value,
          })}
        />
      </PropertyDetailView>

      <PropertyDetailView
          title="Coordinate reference epoch"
          helperText={props.onChange ? <code>yyyy.y</code> : undefined}
          subLabel="The epoch applying to defining coordinates.">
        <InputGroup
          fill
          required
          value={props.itemData.coordinateReferenceEpoch ?? ''}
          readOnly={!props.onChange}
          onChange={evt => props.onChange!({
            ...props.itemData,
            coordinateReferenceEpoch: evt.currentTarget.value,
          })}
        />
      </PropertyDetailView>

      <CombinedExtentWidget
        extent={props.itemData.extent}
        extentRef={props.itemData.extentRef}
        onRefChange={props.onChange
          ? (ref) => props.onChange!(update(props.itemData, { extentRef: { $set: ref } }))
          : undefined}
      />

    </CommonEditView>
  );
};


export interface GeodeticDatumData extends DatumData {
  ellipsoid: string
  primeMeridian: string
}


export const geodeticDatum: ItemClassConfiguration<GeodeticDatumData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Geodetic Datum",
    description: "Geodetic Reference Frame",
    id: 'datums--geodetic',
    alternativeNames: [] as const,
  },
  defaults: {
    ...DATUM_DEFAULTS,
    ellipsoid: '',
    primeMeridian: '',
  },
  views: {
    listItemView: CommonListItemView as ItemListView<GeodeticDatumData>,
    editView: (props) => {
      const EditView = DatumEditView as ItemEditView<GeodeticDatumData>;
      return (
        <EditView {...props}>
          <PropertyDetailView title="Ellipsoid">
            <RelatedItem
              itemRef={props.itemData.ellipsoid
                ? { classID: 'ellipsoid', itemID: props.itemData.ellipsoid }
                : undefined
              }
              mode="id"
              onClear={props.onChange
                && (() => props.onChange!(update(props.itemData, { $unset: ['ellipsoid'] })))}
              onSet={props.onChange
                ? ((spec) => props.onChange!(update(props.itemData, { ellipsoid: spec })))
                : undefined}
              classIDs={['ellipsoid']}
            />
          </PropertyDetailView>
          <PropertyDetailView title="Prime meridian">
            <RelatedItem
              itemRef={props.itemData.primeMeridian
                ? { classID: 'prime-meridian', itemID: props.itemData.primeMeridian }
                : undefined
              }
              mode="id"
              onClear={props.onChange
                && (() => props.onChange!(update(props.itemData, { $unset: ['primeMeridian'] })))}
              onSet={props.onChange
                ? ((spec) => props.onChange!(update(props.itemData, { primeMeridian: spec })))
                : undefined}
              classIDs={['prime-meridian']}
            />
          </PropertyDetailView>
        </EditView>
      );
    },
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
    alternativeNames: [] as const,
  },
  defaults: {
    ...DATUM_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<DatumData>,
    editView: DatumEditView as ItemEditView<DatumData>,
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};


export const engineeringDatum: ItemClassConfiguration<DatumData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Engineering Datum",
    description: "Engineering Reference Frame",
    id: 'datums--engineering',
    alternativeNames: [] as const,
  },
  defaults: {
    ...DATUM_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<DatumData>,
    editView: DatumEditView as ItemEditView<DatumData>,
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
