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
import { type Payload, itemPathInCR, itemPathToItemRef, isAddition } from '@riboseinc/paneron-registry-kit';

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

const itemClassGroups: Record<string, readonly (keyof typeof itemClassConfiguration)[]> = {
  "Datums": [
    'datums--engineering',
    'datums--geodetic',
    'datums--vertical',
  ],
  "Coordinate reference systems": [
    'crs--compound',
    'crs--engineering',
    'crs--geodetic',
    'crs--projected',
    'crs--vertical',
  ],
  "Coordinate operations": [
    'coordinate-ops--conversion',
    'coordinate-ops--concatenated',
    'coordinate-ops--transformation',
  ],
  "Coordinate systems": [
    'coordinate-sys--cartesian',
    'coordinate-sys--ellipsoidal',
    'coordinate-sys--spherical',
    'coordinate-sys--vertical',
  ],
  "Other": [
    'extent',
    'coordinate-op-method',
    'coordinate-op-parameter',
    'coordinate-sys-axis',
    'ellipsoid',
    'prime-meridian',
    'unit-of-measurement',
  ],
} as const;

export default makeRegistryExtension({
  name: "ISO Geodetic Registry",
  itemClassConfiguration,
  itemClassGroups,
  keyExpression: "obj.data.identifier || obj.id",
  defaultSearchCriteria: defaultSearchCriteria as any,
  alterApprovedCR: async function (crID, proposals, origItemData, newItemData, { getMapReducedData }) {
    /** Next unoccupied identifier per class ID. */
    const nextAvailableIDPerClass: Record<string, number> = {};

    for (const [itemPath, proposal] of Object.entries(proposals)) {
      const itemDataPath = itemPathInCR(itemPath, crID);
      const payload: Payload | null = newItemData[itemDataPath]?.data ?? null;
      const preexistingData: Payload | null = origItemData[itemDataPath]?.data ?? null;
      if (isAddition(proposal) && payload) {
        if (payload.identifier > 0) {
          throw new Error("Additions must have negative identifiers at approval time");
        }
        const { classID } = itemPathToItemRef(false, itemDataPath);
        if (!nextAvailableIDPerClass[classID]) {
          try {
            const newIDResult = await getMapReducedData({
              chains: {
                maxID: {
                  mapFunc: `
                    if (value?.data?.identifier) { emit(value.data.identifier); }
                  `,
                  reduceFunc: `
                    return (value > accumulator) ? value : accumulator;
                  `,
                },
              },
            });
            const maybeNum = parseInt(newIDResult.maxID, 10);
            if (!Number.isInteger(maybeNum)) {
              throw new Error("Obtained identifier is not an integer");
            }
            nextAvailableIDPerClass[classID] = maybeNum + 1;
          } catch (e) {
            throw new Error(`Failed to get current maximum identifier for ${classID} (${String(e)})`);
          }
        }
        // Overwrite identifier with next available for this class
        newItemData[itemDataPath]!.data.identifier = nextAvailableIDPerClass[classID];
        // Bump next available identifier
        nextAvailableIDPerClass[classID] += 1;
      } else if (payload && payload.identifier <= 0) {
        throw new Error("Items with non-positive integers as identifiers cannot be amended or clarified");
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
