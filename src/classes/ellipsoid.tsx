/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';

import React from 'react';

import { jsx } from '@emotion/react';

import { Checkbox, ControlGroup, ControlGroupProps, InputGroup } from '@blueprintjs/core';

import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import type { ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import {
  type CommonGRItemData,
  COMMON_PROPERTIES,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  RelatedItem,
} from './common';


export interface EllipsoidData extends CommonGRItemData {
  inverseFlattening: number | null
  inverseFlatteningUoM: string | null

  semiMajorAxis: number | null
  semiMajorAxisUoM: string | null

  isSphere: boolean

  // Ellipsoid only (isSphere == false):
  semiMinorAxis: number | null
  semiMinorAxisUoM: string | null
}


export const ellipsoid: ItemClassConfiguration<EllipsoidData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Ellipsoid",
    description: "Ellipsoid",
    id: 'ellipsoid',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<EllipsoidData>,
    editView: ({ itemData, onChange, itemRef, ...props }) => (
      <CommonEditView
          useRegisterItemData={props.useRegisterItemData}
          getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
          itemData={itemData}
          itemRef={itemRef}
          onChange={onChange
            ? (newData: CommonGRItemData) => {
              onChange?.({ ...itemData, ...newData });
            }
            : undefined}>

        <Checkbox
          disabled={!onChange}
          checked={itemData.isSphere === true}
          label="Is sphere"
          onChange={e => onChange!(update(itemData, { isSphere: { $set: e.currentTarget.checked } }))}
        />

        <PropertyDetailView title="Semi-major axis">
          <FloatWithUoM
            val={[
              itemData.semiMajorAxis,
              itemData.semiMajorAxisUoM,
            ]}
            onChange={onChange
              ? ([num, uom]) => onChange!(update(itemData, {
                  semiMajorAxis: { $set: num },
                  semiMajorAxisUoM: { $set: uom },
                }))
              : undefined}
          />
        </PropertyDetailView>

        {!itemData.isSphere
            || itemData.semiMinorAxis
            || itemData.semiMinorAxisUoM
            || itemData.inverseFlattening
            || itemData.inverseFlatteningUoM
          ? <>
              <PropertyDetailView title="Inverse flattening">
                <InputGroup
                  readOnly={!onChange}
                  onChange={evt => {
                    try {
                      onChange!(update(itemData, {
                        inverseFlattening: { $set: parseInt(evt.currentTarget.value as string, 10) },
                      }))
                    } catch (e) {}
                  }}
                  value={itemData.inverseFlattening?.toString() || ''}
                />
              </PropertyDetailView>

              <PropertyDetailView title="Semi-minor axis">
                <FloatWithUoM
                  val={[
                    itemData.semiMinorAxis,
                    itemData.semiMinorAxisUoM,
                  ]}
                  onChange={onChange
                    ? ([num, uom]) => onChange!(update(itemData, {
                        semiMinorAxis: { $set: num },
                        semiMinorAxisUoM: { $set: uom },
                      }))
                    : undefined}
                />
              </PropertyDetailView>
            </>
          : null}
      </CommonEditView>
    ),
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};


/**
 * Shows a float value with an accompanying unit of measurement related item
 * as a control group.
 */
const FloatWithUoM: React.FC<{
  val: [num: number | null, uom: string | null],
  onChange?: (newVal: [number | null, string | null]) => void,
  fill?: ControlGroupProps["fill"],
  controlGroupProps?: ControlGroupProps,
  className?: string,
}> = function ({ val, onChange, fill, controlGroupProps, className }) {
  return (
    <ControlGroup fill={fill} className={className} {...controlGroupProps}>
      <InputGroup
        readOnly={!onChange}
        onChange={evt => {
          try {
            onChange!([parseFloat(evt.currentTarget.value), val[1]])
          } catch (e) {}
        }}
        value={val[0]?.toString() || ''}
      />
      <RelatedItem
        itemRef={val[1]
          ? { classID: 'unit-of-measurement', itemID: val[1] }
          : undefined
        }
        onClear={onChange
          && (() => onChange([null, null]))}
        onSet={onChange
          ? ((spec) => onChange(update(val, { 1: spec } )))
          : undefined}
        mode="id"
        classIDs={['unit-of-measurement']}
      />
    </ControlGroup>
  );
};
