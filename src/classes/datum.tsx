/** @jsx jsx */

import update from 'immutability-helper';
import { jsx } from '@emotion/react';
import { TextArea, InputGroup, ControlGroup, Button } from '@blueprintjs/core';
import { type ItemClassConfiguration, ItemDetailView, ItemEditView, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';
import GenericRelatedItemView from '@riboseinc/paneron-registry-kit/views/GenericRelatedItemView';

import {
  CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
  COMMON_PROPERTIES,
  Extent,
  DEFAULT_EXTENT,
  ExtentEdit,
} from './common';


export interface DatumData extends CommonGRItemData {
  scope: string
  extent: Extent
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
};

const DatumDetailView: ItemDetailView<DatumData> = function (props) {
  const data = props.itemData;

  return (
    <CommonDetailView {...props}>
      {props.children}

      <PropertyDetailView inline title="Scope">
        {data.scope || ''}
      </PropertyDetailView>

      <PropertyDetailView inline title="Coordinate reference epoch">
        {data.coordinateReferenceEpoch || ''}
      </PropertyDetailView>

      <PropertyDetailView title="Extent">
        {data.extent ? <ExtentEdit extent={data.extent} /> : '—'}
      </PropertyDetailView>

      <PropertyDetailView title="Origin description">
        {data.originDescription || ''}
      </PropertyDetailView>

      <PropertyDetailView title="Release date">
        {data.releaseDate || ''}
      </PropertyDetailView>

    </CommonDetailView>
  );
};

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

      <PropertyDetailView title="Scope">
        <InputGroup
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

      <PropertyDetailView title="Release date">
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

      <PropertyDetailView title="Coordinate reference epoch">
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

      <PropertyDetailView title="Aliases">
        <ControlGroup vertical>
          {props.itemData.aliases.map((alias, idx) =>
            <InputGroup
              key={idx}
              fill
              required
              value={alias}
              readOnly={!props.onChange}
              rightElement={props.onChange
                ? <Button
                    icon='cross'
                    onClick={() => props.onChange!(update(
                      props.itemData,
                      { aliases: { $splice: [[ idx, 1 ]] } }
                    ))}
                  />
                : undefined}
              onChange={evt => props.onChange!(update(
                props.itemData,
                { aliases: { [idx]: { $set: evt.currentTarget.value } } },
              ))}
            />
          )}
          {props.onChange
            ? <Button icon='add' onClick={() => props.onChange!(update(
                props.itemData,
                { aliases: { $push: [''] } },
              ))}>
                Add alias
              </Button>
            : undefined}
        </ControlGroup>
      </PropertyDetailView>

      <PropertyDetailView title="Extent">
        <ExtentEdit
          extent={props.itemData.extent ?? DEFAULT_EXTENT}
          onChange={props.onChange
            ? (extent) => props.onChange!(update(props.itemData, { extent: { $set: extent } }))
            : undefined}
        />
      </PropertyDetailView>

      <PropertyDetailView title="Origin description">
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

    </CommonEditView>
  );
};


interface GeodeticDatumData extends DatumData {
  ellipsoid: string
  primeMeridian: string
}


export const geodeticDatum: ItemClassConfiguration<GeodeticDatumData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Geodetic Datum",
    description: "Geodetic Reference Frame",
    id: 'datums--geodetic',
    alternativeNames: [],
  },
  defaults: {
    ...DATUM_DEFAULTS,
    ellipsoid: '',
    primeMeridian: '',
  },
  views: {
    listItemView: CommonListItemView as ItemListView<GeodeticDatumData>,
    detailView: (props) => {
      const data = props.itemData;

      return (
        <DatumDetailView {...props}>

          {data.ellipsoid
            ? <PropertyDetailView title="Ellipsoid">
                <GenericRelatedItemView
                  itemRef={{ classID: 'ellipsoid', itemID: data.ellipsoid }}
                  getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                  useRegisterItemData={props.useRegisterItemData}
                />
              </PropertyDetailView>
            : '—'}

          {data.primeMeridian
            ? <PropertyDetailView title="Prime meridian">
                <GenericRelatedItemView
                  itemRef={{ classID: 'prime-meridian', itemID: data.primeMeridian }}
                  getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                  useRegisterItemData={props.useRegisterItemData}
                />
              </PropertyDetailView>
            : '—'}

        </DatumDetailView>
      )
    },
    editView: (props) => {
      const EditView = DatumEditView as ItemEditView<GeodeticDatumData>;
      return (
        <EditView {...props}>
          <PropertyDetailView title="Ellipsoid">
            <GenericRelatedItemView
              itemRef={{ classID: 'ellipsoid', itemID: props.itemData.ellipsoid }}
              availableClassIDs={['ellipsoid']}
              onClear={props.onChange
                ? () => props.onChange!(update(props.itemData, { $unset: ['ellipsoid'] }))
                : undefined}
              onChange={props.onChange
                ? (itemRef) => {
                    props.onChange!(update(props.itemData, { ellipsoid: { $set: itemRef.itemID } }))
                  }
                : undefined}
              itemSorter={COMMON_PROPERTIES.itemSorter}
              getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
              useRegisterItemData={props.useRegisterItemData}
            />
          </PropertyDetailView>
          <PropertyDetailView title="Prime meridian">
            <GenericRelatedItemView
              itemRef={{ classID: 'prime-meridian', itemID: props.itemData.primeMeridian }}
              availableClassIDs={['prime-meridian']}
              onClear={props.onChange
                ? () => props.onChange!(update(props.itemData, { $unset: ['primeMeridian'] }))
                : undefined}
              onChange={props.onChange
                ? (itemRef) => {
                    props.onChange!(update(props.itemData, { primeMeridian: { $set: itemRef.itemID } }))
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


export const verticalDatum: ItemClassConfiguration<DatumData> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Vertical Datum",
    description: "Vertical Reference Frame",
    id: 'datums--vertical',
    alternativeNames: [],
  },
  defaults: {
    ...DATUM_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<DatumData>,
    detailView: DatumDetailView as ItemDetailView<DatumData>,
    editView: (props) => {
      const EditView = DatumEditView as ItemEditView<DatumData>;
      return (
        <EditView {...props} />
      );
    },
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
    alternativeNames: [],
  },
  defaults: {
    ...DATUM_DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<DatumData>,
    detailView: DatumDetailView as ItemDetailView<DatumData>,
    editView: (props) => {
      const EditView = DatumEditView as ItemEditView<DatumData>;
      return (
        <EditView {...props} />
      );
    },
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
