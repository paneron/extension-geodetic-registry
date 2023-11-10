/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';

import React from 'react';
import { jsx } from '@emotion/react';
import { ControlGroup, InputGroup } from '@blueprintjs/core';

import { type ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import GenericRelatedItemView from '@riboseinc/paneron-registry-kit/views/GenericRelatedItemView';
import {
  type CommonGRItemData,
  COMMON_PROPERTIES,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
} from './common';


interface PrimeMeridianData extends CommonGRItemData {
  longitudeFromGreenwich: number
  longitudeFromGreenwichUoM: string
}


export const primeMeridian: ItemClassConfiguration<PrimeMeridianData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Prime Meridian",
    description: "Prime Meridian",
    id: 'prime-meridian',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
    longitudeFromGreenwich: 0,
    longitudeFromGreenwichUoM: '',
  },
  views: {
    listItemView: CommonListItemView as ItemListView<PrimeMeridianData>,

    detailView: (props) => {
      const data = props.itemData;

      return (
        <CommonDetailView {...props}>
          <PropertyDetailView title="Longitude from Greenwich">
            <ControlGroup fill>
              <InputGroup readOnly value={data.longitudeFromGreenwich.toString()} />
              <GenericRelatedItemView
                itemRef={{ classID: 'unit-of-measurement', itemID: data.longitudeFromGreenwichUoM }}
                getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                useRegisterItemData={props.useRegisterItemData}
              />
            </ControlGroup>
          </PropertyDetailView>
        </CommonDetailView>
      );
    },

    editView: (props) => <>
      <CommonEditView
          useRegisterItemData={props.useRegisterItemData}
          getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
          itemData={props.itemData}
          itemRef={props.itemRef}
          onChange={props.onChange ? (newData: CommonGRItemData) => {
            if (!props.onChange) { return; }
            props.onChange({ ...props.itemData, ...newData });
          } : undefined} >

        <PropertyDetailView title="Longitude from Greenwich">
          <ControlGroup fill>
            <InputGroup
              value={props.itemData.longitudeFromGreenwich.toString()}
              readOnly={!props.onChange}
              onChange={(evt: React.FormEvent<HTMLInputElement>) => {
                let val: number;
                try {
                  val = parseInt(evt.currentTarget.value, 10);
                } catch (e) {
                  val = 0;
                }
                props.onChange
                  ? props.onChange(update(props.itemData, { longitudeFromGreenwich: { $set: val } }))
                  : void 0;
              }}
            />
            <GenericRelatedItemView
              itemRef={{ classID: 'unit-of-measurement', itemID: props.itemData.longitudeFromGreenwichUoM }}
              getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
              useRegisterItemData={props.useRegisterItemData}
              availableClassIDs={['unit-of-measurement']}
              onClear={props.onChange
                ? () => props.onChange!(update(props.itemData, { $unset: ['longitudeFromGreenwichUoM'] }))
                : undefined}
              onChange={props.onChange
                ? (itemRef) => {
                    if (itemRef.classID.startsWith('unit-of-measurement')) {
                      props.onChange!(update(props.itemData, { longitudeFromGreenwichUoM: { $set: itemRef.itemID } }))
                    }
                  }
                : undefined}

              itemSorter={COMMON_PROPERTIES.itemSorter} />
          </ControlGroup>
        </PropertyDetailView>

      </CommonEditView>
    </>,
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
