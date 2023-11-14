/** @jsx jsx */

import update from 'immutability-helper';
import { jsx } from '@emotion/react';
import { Button, InputGroup, NumericInput, HTMLSelect } from '@blueprintjs/core';
import { type ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';

import {
  type CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  RelatedItem,
  COMMON_PROPERTIES,
} from './common';


const MEASURE_TYPES = [
  'ANGLE',
  'AREA',
  'LENGTH',
  'SCALE',
  'TIME',
  'VELOCITY',
  'VOLUME',
  'WEIGHT',
] as const;

type MeasureType = typeof MEASURE_TYPES[number];

export function isMeasureType(val: unknown): val is MeasureType {
  return typeof val === 'string' && MEASURE_TYPES.indexOf(val as typeof MEASURE_TYPES[number]) >= 0;
}

export interface UoMData extends CommonGRItemData {
  /** “factor A” */
  denominator: null | number
  /** “factor C” */
  numerator: null | number

  measureType: typeof MEASURE_TYPES[number]

  symbol: string | null

  /**
   * Per sheet:
   * “Unit of measurement Standard Target unit of measurement identifier”
   * “used to define this unit”.
   */
  baseUnit?: string
}

export const DEFAULTS: UoMData = {
  ...SHARED_DEFAULTS,
  measureType: 'LENGTH',
  symbol: null,
  denominator: null,
  numerator: null,
};


export const unitOfMeasurement: ItemClassConfiguration<UoMData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Unit",
    description: "Unit of Measurement",
    id: 'unit-of-measurement',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<UoMData>,
    editView: (props) => (
      <CommonEditView
          itemData={props.itemData}
          itemRef={props.itemRef}
          onChange={props.onChange ? (newData: CommonGRItemData) => {
            if (!props.onChange) { return; }
            props.onChange({ ...props.itemData, ...newData });
          } : undefined}>

        <PropertyDetailView title="Measure type">
          {props.onChange
            ? <HTMLSelect
                value={props.itemData.measureType}
                required
                disabled={!props.onChange}
                options={MEASURE_TYPES.map(m => ({ value: m, label: m }))}
                onChange={(evt) =>
                  isMeasureType(evt.currentTarget.value)
                    ? props.onChange?.({ ...props.itemData, measureType: evt.currentTarget.value })
                    : void 0
                }
              />
            : <InputGroup readOnly value={props.itemData.measureType} />}
        </PropertyDetailView>

        <PropertyDetailView title="Symbol">
          <InputGroup
            required
            value={props.itemData.symbol ?? ''}
            disabled={!props.onChange}
            onChange={(evt) => props.onChange?.({ ...props.itemData, symbol: evt.currentTarget.value })}
          />
        </PropertyDetailView>

        <PropertyDetailView title="Standard Target base unit">
          <RelatedItem
            itemRef={props.itemData.baseUnit
              ? { classID: 'unit-of-measurement', itemID: props.itemData.baseUnit }
              : undefined
            }
            mode="id"
            onClear={props.onChange
              && (() => props.onChange!(update(props.itemData, { $unset: ['baseUnit'] })))}
            onSet={props.onChange
              ? ((spec) => props.onChange!(update(props.itemData, { baseUnit: spec })))
              : undefined}
            classIDs={[
              'unit-of-measurement',
            ]}
          />
        </PropertyDetailView>

        <PropertyDetailView title="Numerator (factor C)">
          <NumericInput
            required
            buttonPosition={props.onChange ? undefined : 'none'}
            rightElement={props.onChange
              ? <Button
                  disabled={!props.onChange}
                  icon="cross"
                  onClick={() => props.onChange?.({ ...props.itemData, numerator: null })}
                />
              : undefined}
            value={props.itemData.numerator ?? ''}
            disabled={!props.onChange}
            onValueChange={(num) => props.onChange?.({ ...props.itemData, numerator: num })}
          />
        </PropertyDetailView>

        <PropertyDetailView title="Denominator (factor A)">
          <NumericInput
            required
            buttonPosition={props.onChange ? undefined : 'none'}
            rightElement={props.onChange
              ? <Button
                  disabled={!props.onChange}
                  icon="cross"
                  onClick={() => props.onChange?.({ ...props.itemData, denominator: null })}
                />
              : undefined}
            value={props.itemData.denominator ?? ''}
            disabled={!props.onChange}
            onValueChange={(num) => props.onChange?.({ ...props.itemData, denominator: num })}
          />
        </PropertyDetailView>
      </CommonEditView>
    ),
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
