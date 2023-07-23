/** @jsx jsx */

import update from 'immutability-helper';
import { Button, ControlGroup, H3, UL } from '@blueprintjs/core';
import { jsx, css } from '@emotion/react';
import { type ItemClassConfiguration, ItemDetailView, ItemEditView, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import GenericRelatedItemView from '@riboseinc/paneron-registry-kit/views/GenericRelatedItemView';
import {
  DEFAULTS as COMMON_DEFAULTS,
  COMMON_PROPERTIES,
  AliasesDetail,
  ListItemView as CommonListItemView,
  EditView as CommonEditView,
  DetailView as CommonDetailView,
  type CommonGRItemData,
} from './common';


interface CoordinateSystemData extends CommonGRItemData {
  coordinateSystemAxes: string[]
}

export const DEFAULTS: CoordinateSystemData = {
  ...COMMON_DEFAULTS,
  coordinateSystemAxes: [],
};

const CoordinateSystemDetailView: ItemDetailView<CoordinateSystemData> = function (props) {
  const data = props.itemData;
  const axes = data.coordinateSystemAxes ?? [];

  return (
    <CommonDetailView {...props}>

      {(data.aliases || []).length > 0
        ? <AliasesDetail aliases={data.aliases} />
        : null}

      <H3>Axes</H3>

      <UL css={css`padding-left: 0; list-style: square;`}>
        {axes.map((axis, idx) =>
          <li key={idx} css={css`margin-top: 1em;`}>
            <PropertyDetailView title={`Axis ${idx + 1}`}>
              <GenericRelatedItemView
                itemRef={{ classID: 'coordinate-sys-axis', itemID: axis }}
                getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                useRegisterItemData={props.useRegisterItemData}
              />
            </PropertyDetailView>
          </li>
        )}
      </UL>
    </CommonDetailView>
  );
};

const CoordinateSystemEditView: ItemEditView<CoordinateSystemData> = function (props)  {
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


      <PropertyDetailView title="Axes">
        <ControlGroup vertical>
          {(props.itemData.coordinateSystemAxes || []) .map((axis, idx) =>
            <li key={idx} css={css`margin-top: 1em;`}>
              <PropertyDetailView title={`Axis ${idx + 1}`}>
                <GenericRelatedItemView
                  itemRef={{ classID: 'coordinate-sys-axis', itemID: axis }}
                  availableClassIDs={['coordinate-sys-axis']}
                  onClear={props.onChange
                    ? () => props.onChange!(update(
                      props.itemData,
                      { coordinateSystemAxes: { $splice: [[ idx, 1 ]] } }
                    ))
                    : undefined}
                  onChange={props.onChange
                    ? (itemRef) => props.onChange!(update(
                      props.itemData,
                      { coordinateSystemAxes: { [idx]: { $set: itemRef.itemID } } },
                    ))
                    : undefined}
                  itemSorter={COMMON_PROPERTIES.itemSorter}
                  getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                  useRegisterItemData={props.useRegisterItemData}
                />
              </PropertyDetailView>
            </li>
          )}
          {props.onChange
            ? <Button icon='add' onClick={() => props.onChange!(update(
                props.itemData,
                { coordinateSystemAxes: { $push: [''] } },
              ))}>
                Add axis
              </Button>
            : undefined}
        </ControlGroup>
      </PropertyDetailView>
    </CommonEditView>
  );
}

export const cartesianCoordinateSystem: ItemClassConfiguration<CoordinateSystemData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Cartesian Coordinate System",
    description: "Cartesian Coordinate System",
    id: 'coordinate-sys--cartesian',
    alternativeNames: [],
  },
  defaults: {
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateSystemData>,
    detailView: CoordinateSystemDetailView,
    editView: CoordinateSystemEditView,
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};


export const ellipsoidalCoordinateSystem: ItemClassConfiguration<CoordinateSystemData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Ellipsoidal Coordinate System",
    description: "Ellipsoidal Coordinate System",
    id: 'coordinate-sys--ellipsoidal',
    alternativeNames: [],
  },
  defaults: {
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateSystemData>,
    detailView: CoordinateSystemDetailView,
    editView: CoordinateSystemEditView,
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};


export const verticalCoordinateSystem: ItemClassConfiguration<CoordinateSystemData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Vertical Coordinate System",
    description: "Vertical Coordinate System",
    id: 'coordinate-sys--vertical',
    alternativeNames: [],
  },
  defaults: {
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateSystemData>,
    detailView: CoordinateSystemDetailView,
    editView: CoordinateSystemEditView,
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};


export const sphericalCoordinateSystem: ItemClassConfiguration<CoordinateSystemData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Spherical Coordinate System",
    description: "Spherical Coordinate System",
    id: 'coordinate-sys--spherical',
    alternativeNames: [],
  },
  defaults: {
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateSystemData>,
    detailView: CoordinateSystemDetailView,
    editView: CoordinateSystemEditView,
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
