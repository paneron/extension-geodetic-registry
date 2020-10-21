/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Checkbox, ControlGroup, InputGroup } from '@blueprintjs/core';

import { ItemClassConfiguration, ItemListView } from '@riboseinc/paneron-registry-kit/types';
import {
  CommonGRItemData,
  COMMON_PROPERTIES,
  DEFAULTS as SHARED_DEFAULTS,
  EditView as CommonEditView,
  ListItemView as CommonListItemView,
  DetailView as CommonDetailView,
} from './common';
import { GenericRelatedItemView, PropertyDetailView } from '@riboseinc/paneron-registry-kit/views/util';


interface EllipsoidData extends CommonGRItemData {
  inverseFlattening: number | null
  inverseFlatteningUoM: string

  semiMajorAxis: number | null
  semiMajorAxisUoM: string

  semiMinorAxis: number
  semiMinorAxisUoM: string

  isSphere: boolean
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

    detailView: (props) => {
      const data = props.itemData;

      return (
        <CommonDetailView {...props}>

          <Checkbox disabled checked={data.isSphere === true} label="Is sphere" />

          <PropertyDetailView title="Inverse flattening">
            <ControlGroup fill>
              <InputGroup readOnly value={data.inverseFlattening?.toString() || '(no value)'} />
              <GenericRelatedItemView
                React={props.React}
                itemRef={{ classID: 'unit-of-measurement', itemID: data.inverseFlatteningUoM }}
                getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                useRegisterItemData={props.useRegisterItemData}
              />
            </ControlGroup>
          </PropertyDetailView>

          <PropertyDetailView title="Semi-major axis">
            <ControlGroup fill>
              <InputGroup readOnly value={data.semiMajorAxis?.toString() || '(no value)'} />
              <GenericRelatedItemView
                React={props.React}
                itemRef={{ classID: 'unit-of-measurement', itemID: data.semiMajorAxisUoM }}
                getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                useRegisterItemData={props.useRegisterItemData}
              />
            </ControlGroup>
          </PropertyDetailView>

          <PropertyDetailView title="Semi-minor axis">
            <ControlGroup fill>
              <InputGroup readOnly value={data.semiMinorAxis?.toString() || '(no value)'} />
              <GenericRelatedItemView
                React={props.React}
                itemRef={{ classID: 'unit-of-measurement', itemID: data.semiMinorAxisUoM }}
                getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
                useRegisterItemData={props.useRegisterItemData}
              />
            </ControlGroup>
          </PropertyDetailView>

        </CommonDetailView>
      );
    },

    editView: (props) => <props.React.Fragment>
      <CommonEditView
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        React={props.React}
        itemData={props.itemData}
        onChange={props.onChange ? (newData: CommonGRItemData) => {
          if (!props.onChange) { return; }
          props.onChange({ ...props.itemData, ...newData });
        } : undefined} />
    </props.React.Fragment>,
  },

  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};
