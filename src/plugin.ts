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
import { incompleteItemRefToItemPathPrefix} from '@riboseinc/paneron-registry-kit';
import { itemPathInCR, itemPathToItemRef } from '@riboseinc/paneron-registry-kit/views/itemPathUtils';
import { isAddition } from '@riboseinc/paneron-registry-kit/types/proposal';
import type { Payload } from '@riboseinc/paneron-registry-kit/types/item';

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
  alterApprovedCR: async function (crID, proposals, origItemData, newItemData, { getMapReducedData }) {
    for (const [itemPath, proposal] of Object.entries(proposals)) {
      const itemDataPath = itemPathInCR(itemPath, crID);
      const payload: Payload | null = newItemData[itemDataPath]?.data ?? null;
      const preexistingData: Payload | null = origItemData[itemDataPath]?.data ?? null;
      if (isAddition(proposal) && payload) {
        if (payload.identifier >= 0) {
          throw new Error("Additions must have negative identifiers at approval time");
        }
        try {
          const { subregisterID, classID } = itemPathToItemRef(false, itemDataPath);
          const itemPathPrefix = incompleteItemRefToItemPathPrefix({ subregisterID, classID });
          const newIDResult = await getMapReducedData({
            chains: {
              maxID: {
                mapFunc: `
                  if (key.startsWith("${itemPathPrefix}")) { emit(value?.data?.identifier ?? 0); }
                `,
                reduceFunc: `
                  return (value > accumulator) ? (value + 1) : accumulator;
                `,
              },
            },
          });
          const maybeNum = parseInt(newIDResult.maxID, 10);
          // Overwrite identifier with next available one
          newItemData[itemDataPath]!.data.identifier = maybeNum;
        } catch (e) {
          throw new Error(`Failed to alter item identifier (${String(e)})`);
        }
      } else if (payload && payload.identifier < 0) {
        throw new Error("Items with negative identifier cannot be amended or clarified");
      } else if (preexistingData && payload && preexistingData.identifier !== payload.identifier) {
        throw new Error("Item identifier cannot be changed after addition");
      }
    }
    return {
      proposals,
      origItemData,
      newItemData,
    };
  },
  getQuickSearchPredicate: function getQuickSearchPredicate(quickSearchString) {
    return `[obj.data?.name ?? '', obj.data?.identifier?.toString()].join('').toLowerCase().indexOf("${quickSearchString.toLowerCase()}") >= 0`;
  },
});
