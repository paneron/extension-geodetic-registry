import log from 'electron-log';
import React from 'react';
import { RepositoryViewProps } from '@riboseinc/paneron-plugin-kit/types';
import { RegistryView } from '@riboseinc/paneron-registry-kit/RegistryView';
import { Citation, ItemClassConfiguration } from '@riboseinc/paneron-registry-kit/types';


interface CommonGRItemData {
  remarks: string
  informationSource: Citation[]
}

interface TransformationData extends CommonGRItemData {
}


const transformation: ItemClassConfiguration<TransformationData> = {
  meta: {
    title: "Coordinate Operations/Transformation",
    description: "Transformation",
    id: 'coordinate-ops/transformation',
    alternativeNames: [],
  },
  defaults: {},
  views: {
    listItemView: () => <>TBD</>,
    detailView: () => <>TBD</>,
    createView: () => <>TBD</>,
    editView: () => <>TBD</>,
  },
  validatePayload: async () => true,
  sanitizePayload: async (t) => t,
};


const itemConfig = {
  transformation,
};


export const RepositoryView: React.FC<RepositoryViewProps> =
function (props) {
  log.debug("Rendering Geodetic Registry view…");
  return <RegistryView
    {...props}
    itemClassConfiguration={itemConfig}
  />
};
