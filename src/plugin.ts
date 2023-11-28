// import { makeExtension } from '@riboseinc/paneron-extension-kit';
// //import exportPublicSite from '@riboseinc/paneron-registry-kit/site-builder';
// import datasetInitializer from '@riboseinc/paneron-registry-kit/migrations/initial';
// import mainView from './RepoView';
// 
// 
// export default makeExtension({
//   mainView,
//   name: "Geodetic registry",
//   requiredHostAppVersion: "^2.0.0",
//   datasetMigrations: {},
//   datasetInitializer,
//   exportFormats: {
//     //['public-site']: {
//     //  name: "Public website",
//     //  description: "The current version of the register (excluding proposals), rendered in HTML and ready for web serving.",
//     //  exporter: exportPublicSite,
//     //},
//   },
// });


import { makeRegistryExtension, CRITERIA_CONFIGURATION } from '@riboseinc/paneron-registry-kit';

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

export default makeRegistryExtension({
  name: "ISO Geodetic Registry",
  itemClassConfiguration,
  keyExpression: "obj.data.identifier || obj.id",
  defaultSearchCriteria: defaultSearchCriteria as any,
  getQuickSearchPredicate: function getQuickSearchPredicate(quickSearchString) {
    return `[obj.data?.name ?? '', obj.data?.identifier?.toString()].join('').toLowerCase().indexOf("${quickSearchString.toLowerCase()}") >= 0`;
  },
});
