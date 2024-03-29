/** @jsx jsx */

import { jsx } from '@emotion/react';

import { RegistryView } from '@riboseinc/paneron-registry-kit/views';
import CRITERIA_CONFIGURATION from '@riboseinc/paneron-registry-kit/views/FilterCriteria/CRITERIA_CONFIGURATION';
import { itemClassConfiguration } from './registryConfig';


const defaultClassID = Object.keys(itemClassConfiguration)[0];
const defaultCriteria = CRITERIA_CONFIGURATION['item-class'].toQuery(
  { classID: defaultClassID },
  { itemClasses: itemClassConfiguration },
);
const defaultSearchCriteria = {
  require: 'all',
  criteria: [{ key: 'item-class', query: defaultCriteria }],
} as const;

const getQuickSearchPredicate = function getQuickSearchPredicate(quickSearchString: string) {
  return `[obj.data?.name ?? '', obj.data?.identifier?.toString()].join('').toLowerCase().indexOf("${quickSearchString.toLowerCase()}") >= 0`;
}


export default function () {
  return <RegistryView
    itemClassConfiguration={itemClassConfiguration}
    keyExpression="obj.data.identifier || obj.id"
    defaultSearchCriteria={defaultSearchCriteria as any}
    getQuickSearchPredicate={getQuickSearchPredicate}
  />
};
