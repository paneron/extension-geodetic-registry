/** @jsx jsx */

import { jsx, css } from '@emotion/core';

import { FormGroup,  H4,  H5,  InputGroup, NumericInput, Tag, TextArea } from '@blueprintjs/core';
import { Citation, ItemClassConfiguration, ItemDetailView, ItemEditView } from '@riboseinc/paneron-registry-kit/types';


export interface CommonGRItemData {
  name: string
  identifier: number
  description: string
  remarks: string
  informationSource: Citation[]
}


export const DEFAULTS = {
  identifier: 0,
  informationSource: [],
  remarks: '',
  description: '',
};


export const EditView: ItemEditView<CommonGRItemData> = function ({ React, itemData, onChange }) {
  function textInputProps
  <F extends keyof Omit<CommonGRItemData, 'informationSource'>>
  (fieldName: F) {
    return {
      disabled: !onChange,
      onChange: (evt: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!onChange) { return; }
        onChange({ ...itemData, [fieldName]: evt.currentTarget.value })
      },
    }
  }

  return <React.Fragment>

    <FormGroup label="GR identifier:">
      <NumericInput required value={itemData.identifier} disabled={!onChange} onValueChange={onChange
        ? (val) => (onChange ? onChange({ ...itemData, identifier: val }) : void 0)
        : undefined} />
    </FormGroup>

    <FormGroup label="Name:">
      <InputGroup required value={itemData.name} {...textInputProps('name')} />
    </FormGroup>

    <FormGroup label="Description:">
      <TextArea fill required value={itemData.description} {...textInputProps('description')} />
    </FormGroup>

    <FormGroup label="Remarks:">
      <TextArea fill required value={itemData.remarks} {...textInputProps('remarks')} />
    </FormGroup>

  </React.Fragment>;
};


export const ListItemView: ItemClassConfiguration<CommonGRItemData>["views"]["listItemView"] =
(props) => (
  <span css={css`overflow: hidden; text-overflow: ellipsis`}>
    <Tag minimal>{props.itemData.identifier}</Tag>
    &emsp;
    {props.itemData.name}
  </span>
);


export const DetailView: ItemDetailView<CommonGRItemData> = (props) => {
  const data = props.itemData;

  return (
    <props.React.Fragment>

      <H4><Tag minimal>{data.identifier}</Tag>&ensp;{data.name}</H4>

      <H5>Description</H5>
      <p>{data.description || '—'}</p>

      <H5>Remarks</H5>
      <p>{data.remarks || '—'}</p>

    </props.React.Fragment>
  );
};
