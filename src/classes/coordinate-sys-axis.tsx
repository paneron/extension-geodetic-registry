/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';
import { jsx } from '@emotion/react';
import React from 'react';

import { InputGroup } from '@blueprintjs/core';
import { type ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import {
  type CommonGRItemData,
  COMMON_PROPERTIES,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  RelatedItem,
} from './common';


export interface CoordinateSystemAxisData extends CommonGRItemData {
  abbreviation: string
  orientation: string
  unitOfMeasurement: string
  maxValue: number | null
  minValue: number | null
  rangeMeaning?: 'exact' | 'wraparound'
}


export const coordinateSystemAxis: ItemClassConfiguration<CoordinateSystemAxisData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Coordinate System Axis",
    description: "Coordinate System Axis",
    id: 'coordinate-sys-axis',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
    abbreviation: '',
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateSystemAxisData>,

    editView: (props) => <>
      <CommonEditView
          useRegisterItemData={props.useRegisterItemData}
          getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
          itemData={props.itemData}
          itemRef={props.itemRef}
          onChange={props.onChange ? (newData: CommonGRItemData) => {
            if (!props.onChange) { return; }
            props.onChange({ ...props.itemData, ...newData });
          } : undefined}>

        <PropertyDetailView title="Abbreviation">
          <InputGroup
            required
            value={props.itemData.abbreviation ?? ''}
            readOnly={!props.onChange}
            onChange={(evt) => props.onChange?.({ ...props.itemData, abbreviation: evt.currentTarget.value })}
          />
        </PropertyDetailView>

        <PropertyDetailView title="Orientation">
          <InputGroup
            required
            value={props.itemData.orientation ?? ''}
            readOnly={!props.onChange}
            onChange={(evt) => props.onChange?.({ ...props.itemData, orientation: evt.currentTarget.value })}
          />
        </PropertyDetailView>

        <PropertyDetailView title="Unit of measurement">
          <RelatedItem
            itemRef={React.useMemo(
              (() => props.itemData.unitOfMeasurement
                ? { classID: 'unit-of-measurement', itemID: props.itemData.unitOfMeasurement }
                : undefined),
              [props.itemData.unitOfMeasurement])}
            mode="id"
            onClear={props.onChange
              && React.useCallback(() => props.onChange!(update(props.itemData, { $unset: ['unitOfMeasurement'] })), [props.onChange, props.itemData])}
            onSet={props.onChange
              ? React.useCallback((spec) => props.onChange!(update(props.itemData, { unitOfMeasurement: spec })), [props.onChange, props.itemData])
              : undefined}
            classIDs={React.useMemo((() => ['unit-of-measurement']), []) as [string]}
          />
        </PropertyDetailView>
      </CommonEditView>
    </>,
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
