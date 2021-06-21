/** @jsx jsx */

import log from 'electron-log';
import { jsx } from '@emotion/react';

Object.assign(console, log);

import { RegistryView } from '@riboseinc/paneron-registry-kit/views';
import CRITERIA_CONFIGURATION from '@riboseinc/paneron-registry-kit/views/FilterCriteria/CRITERIA_CONFIGURATION';
import { itemClassConfiguration } from './registryConfig';


const defaultClassID = Object.keys(itemClassConfiguration)[0];
const defaultCriteria = CRITERIA_CONFIGURATION['item-class'].toQuery(
  { classID: defaultClassID },
  { itemClasses: itemClassConfiguration },
);


export default function () {
  return <RegistryView
    itemClassConfiguration={itemClassConfiguration}
    keyExpression="obj.data.identifier || obj.id"
    defaultSearchCriteria={{ require: 'all', criteria: [{ key: 'item-class', query: defaultCriteria }] }}
  />
};
