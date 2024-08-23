/** @jsx jsx */

import update from 'immutability-helper';
import { jsx } from '@emotion/react';
import { Button, TextArea, ControlGroup } from '@blueprintjs/core';
import type { Citation, ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import { PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';

import {
  type CommonGRItemData,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  COMMON_PROPERTIES,
  ItemList,
  RelatedItem,
  InformationSourceEdit,
  getInformationSourceStub,
} from './common';


export interface CoordinateOpMethod extends CommonGRItemData {
  parameters: Readonly<string[]>
  sourceCRSDimensionCount?: number
  targetCRSDimensionCount?: number

  /** Mutually exclusive with formulaCitation. */
  formula?: string | null

  /** Mutually exclusive with formula. */
  formulaCitation?: Citation
}

export const DEFAULTS: CoordinateOpMethod = {
  ...SHARED_DEFAULTS,
  parameters: [],
} as const;


export const coordinateOpMethod: ItemClassConfiguration<CoordinateOpMethod> = {
  ...COMMON_PROPERTIES,
  meta: {
    title: "Coordinate Operation Method",
    description: "Coordinate Operation Method",
    id: 'coordinate-op-method',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
    ...DEFAULTS,
  },
  views: {
    listItemView: CommonListItemView as ItemListView<CoordinateOpMethod>,
    editView: ({ itemRef, itemData, onChange }) => (
      <CommonEditView
          itemData={itemData}
          itemRef={itemRef}
          onChange={onChange ? (newData: CommonGRItemData) => {
            if (!onChange) { return; }
            onChange({ ...itemData, ...newData });
          } : undefined}>

        <ItemList
          items={itemData.parameters}
          simpleItems
          itemLabel="parameter"
          onChangeItems={onChange
            ? (spec) => onChange!(update(itemData, { parameters: spec }))
            : undefined}
          placeholderItem={''}
          itemRenderer={(param, _idx, handleChange, deleteButton) =>
            <ControlGroup>
              <RelatedItem
                itemRef={{ classID: 'coordinate-op-parameter', itemID: param }}
                mode="id"
                fill
                classIDs={['coordinate-op-parameter']}
                onClear={onChange
                  ? () => handleChange!({ $set: '' })
                  : undefined}
                onSet={handleChange
                  ? (spec) => handleChange!(spec)
                  : undefined}
              />
              {deleteButton}
            </ControlGroup>
          }
        />

        <PropertyDetailView
            label="Formula"
            subLabel={onChange
              ? "Mutually exclusive with formula information source."
              : undefined}>
          <TextArea
            fill
            value={itemData.formula ?? ''}
            disabled={itemData.formulaCitation !== undefined}
            readOnly={!onChange}
            onChange={(evt) => {
              onChange
                ? onChange(update(itemData, { formula: { $set: evt.currentTarget.value } }))
                : void 0;
            }}
          />
        </PropertyDetailView>

        <PropertyDetailView
            subLabel={onChange ? "Mutually exclusive with formula." : undefined}
            helperText={itemData.formulaCitation && onChange
              ? <Button
                    onClick={() => onChange(update(itemData, { $unset: ['formulaCitation'] }))}
                    icon="remove"
                    outlined
                    intent="danger">
                  Remove formula source
                </Button>
              : onChange
                ? <Button
                      onClick={() => onChange(update(itemData, { formulaCitation: { $set: getInformationSourceStub() } }))}
                      intent="primary"
                      outlined
                      disabled={(itemData.formula ?? '') !== ''}
                      title="Add information source"
                      icon="add">
                    Add
                  </Button>
                : null}
            label="Formula information source">
          {itemData.formulaCitation
            ? <InformationSourceEdit
                citation={itemData.formulaCitation}
                onChange={onChange
                  ? (citation) => onChange(update(itemData, { formulaCitation: { $set: citation } }))
                  : undefined}
              />
            : "N/A"}
        </PropertyDetailView>

      </CommonEditView>
    ),
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
