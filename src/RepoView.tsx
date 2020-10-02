/** @jsx jsx */

//import log from 'electron-log';

import { jsx, css } from '@emotion/core';

import update from 'immutability-helper';

import { ControlGroup, FormGroup, H4, H5, InputGroup, NumericInput, Tag, TextArea } from '@blueprintjs/core';
import { RepositoryViewProps } from '@riboseinc/paneron-extension-kit/types';
import { RegistryView } from '@riboseinc/paneron-registry-kit/views';
import { Citation, ItemClassConfiguration, ItemDetailView, ItemEditView, ItemListView } from '@riboseinc/paneron-registry-kit/types';


interface Extent {
  n: number
  e: number
  s: number
  w: number
  name: string
}

interface CommonGRItemData {
  name: string
  identifier: number
  description: string
  remarks: string
  informationSource: Citation[]
}

interface TransformationData extends CommonGRItemData {
  extent: Extent
  operationVersion: string

  sourceCRS?: { classID: string, itemID: string }
  targetCRS?: { classID: string, itemID: string }
  coordOperationMethod?: string
}

interface CRSData extends CommonGRItemData {
  scope: string
}


const CommontEditView: ItemEditView<CommonGRItemData> = function ({ React, itemData, onChange }) {
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


const SHARED_DEFAULTS = {
  identifier: 0,
  informationSource: [],
  remarks: '',
  description: '',
}

const CRS_DEFAULTS = {
  ...SHARED_DEFAULTS,
  scope: '',
}


const ListItemView: ItemClassConfiguration<CommonGRItemData>["views"]["listItemView"] =
(props) => (
  <span css={css`overflow: hidden; text-overflow: ellipsis`}>
    <Tag minimal>{props.itemData.identifier}</Tag>
    &emsp;
    {props.itemData.name}
  </span>
);


const SharedDetailView: ItemDetailView<CommonGRItemData> = (props) => {
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


const geodeticCRS: ItemClassConfiguration<CRSData> = {
  meta: {
    title: "Geodetic CRS",
    description: "Geodetic Coordinate Reference System",
    id: 'crs--geodetic',
    alternativeNames: [],
  },
  defaults: {
    ...CRS_DEFAULTS,
  },
  views: {
    listItemView: ListItemView as ItemListView<CRSData>,
    detailView: SharedDetailView as ItemDetailView<CRSData>,
    editView: (props) => (
      <CommontEditView
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        React={props.React}
        itemData={props.itemData}
        onChange={props.onChange ? (newData: CommonGRItemData) => {
          if (!props.onChange) { return; }
          props.onChange({ ...props.itemData, ...newData });
        } : undefined} />
    ),
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};

const verticalCRS: ItemClassConfiguration<CRSData> = {
  meta: {
    title: "Vertical CRS",
    description: "Vertical Coordinate Reference System",
    id: 'crs--vertical',
    alternativeNames: [],
  },
  defaults: {
    ...CRS_DEFAULTS,
  },
  views: {
    listItemView: ListItemView as ItemListView<CRSData>,
    detailView: SharedDetailView as ItemDetailView<CRSData>,
    editView: (props) => (
      <CommontEditView
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        React={props.React}
        itemData={props.itemData}
        onChange={props.onChange ? (newData: CommonGRItemData) => {
          if (!props.onChange) { return; }
          props.onChange({ ...props.itemData, ...newData });
        } : undefined} />
    ),
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};

const transformation: ItemClassConfiguration<TransformationData> = {
  meta: {
    title: "Coordinate Operations — Transformation",
    description: "Transformation",
    id: 'coordinate-ops--transformation',
    alternativeNames: [],
  },
  defaults: {
    ...SHARED_DEFAULTS,
    extent: { name: '', n: 0, e: 0, s: 0, w: 0 },
    operationVersion: '',
  },
  views: {
    listItemView: ListItemView as ItemListView<TransformationData>,

    detailView: (props) => {
      const data = props.itemData;
      const extent = data.extent;

      // const sourceCRS = data.sourceCRS!;
      // const targetCRS = data.targetCRS!;

      // const sourceCRSCls = props.getRelatedItemClassConfiguration(sourceCRS.classID);
      // const targetCRSCls = props.getRelatedItemClassConfiguration(targetCRS.classID);

      // const SourceCRSView = sourceCRSCls.itemView;
      // const TargetCRSView = targetCRSCls.itemView;

      return (
        <props.React.Fragment>

          <SharedDetailView {...props} />

          <H5>Operation version</H5>
          <p>{data.operationVersion || '—'}</p>

          <H5>Extent</H5>
          {extent
            ? <p>
                {extent.name}:
                &emsp;
                N={extent.n}
                &ensp;
                E={extent.e}
                &ensp;
                S={extent.s}
                &ensp;
                W={extent.w}
              </p>
            : '—'}

          <H5>Source CRS</H5>
          {/*<SourceCRSView React={React} />*/}

          <H5>Target CRS</H5>

        </props.React.Fragment>
      );
    },

    editView: (props) => <props.React.Fragment>

      <CommontEditView
        getRelatedItemClassConfiguration={props.getRelatedItemClassConfiguration}
        React={props.React}
        itemData={props.itemData}
        onChange={props.onChange ? (newData: CommonGRItemData) => {
          if (!props.onChange) { return; }
          props.onChange({ ...props.itemData, ...newData });
        } : undefined} />

      <FormGroup label="Operation version:">
        <InputGroup
          placeholder="E.g., GA v2"
          value={props.itemData.operationVersion || ''}
          disabled={!props.onChange}
          onChange={(evt: React.FormEvent<HTMLInputElement>) => {
            props.onChange
              ? props.onChange(update(props.itemData, { operationVersion: { $set: evt.currentTarget.value } }))
              : void 0;
          }}
        />
      </FormGroup>

      <FormGroup label="Source CRC:">
        <InputGroup
          value={props.itemData.operationVersion || ''}
          disabled={!props.onChange}
          onChange={(evt: React.FormEvent<HTMLInputElement>) => {
            props.onChange
              ? props.onChange(update(props.itemData, { operationVersion: { $set: evt.currentTarget.value } }))
              : void 0;
          }}
        />
      </FormGroup>

      <FormGroup label="Extent:">
        <ControlGroup>
          <InputGroup
            placeholder="E.g., World"
            value={props.itemData.extent?.name || ''}
            disabled={!props.onChange}
            onChange={(evt: React.FormEvent<HTMLInputElement>) => {
              props.onChange
                ? props.onChange(update(props.itemData, { extent: { name: { $set: evt.currentTarget.value } } }))
                : void 0;
            }}
          />
          <NumericInput
            placeholder="N"
            value={props.itemData.extent?.n || 0}
            disabled={!props.onChange}
            onValueChange={(val) => {
              props.onChange
                ? props.onChange(update(props.itemData, { extent: { n: { $set: val } } }))
                : void 0;
            }}
          />
          <NumericInput
            placeholder="E"
            value={props.itemData.extent?.e || 0}
            onValueChange={(val) => {
              props.onChange
                ? props.onChange(update(props.itemData, { extent: { e: { $set: val } } }))
                : void 0;
            }}
          />
          <NumericInput
            placeholder="S"
            value={props.itemData.extent?.s || 0}
            disabled={!props.onChange}
            onValueChange={(val) => {
              props.onChange
                ? props.onChange(update(props.itemData, { extent: { s: { $set: val } } }))
                : void 0;
            }}
          />
          <NumericInput
            placeholder="W"
            value={props.itemData.extent?.w || 0}
            onValueChange={(val) => {
              props.onChange
                ? props.onChange(update(props.itemData, { extent: { w: { $set: val } } }))
                : void 0;
            }}
          />
        </ControlGroup>
      </FormGroup>
    </props.React.Fragment>,
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};


const itemConfig = {
  "coordinate-ops--transformation": transformation,
  "crs--vertical": verticalCRS,
  "crs--geodetic": geodeticCRS,
};


export const RepositoryView: React.FC<RepositoryViewProps> =
function (props) {
  return <RegistryView
    {...props}
    itemClassConfiguration={itemConfig}
  />
};
