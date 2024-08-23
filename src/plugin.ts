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
import { type Payload, itemPathInCR, isAddition } from '@riboseinc/paneron-registry-kit';

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
  keyExpression: "new Date(obj.dateAccepted).getTime() + (obj.data.identifier || (new Date()).getTime())",
  defaultSearchCriteria: defaultSearchCriteria as any,
  alterApprovedCR: async function (crID, proposals, origItemData, newItemData, { getMapReducedData }) {

    // Pick next available identifier, globally
    const maxIDResult = await getMapReducedData({
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

    /* Currently maximum identifier, globally. */
    let currentMaxID = parseInt(maxIDResult.maxID, 10);
    if (!Number.isInteger(currentMaxID)) {
      throw new Error("Couldn’t determine next identifier: obtained maximum identifier is not an integer");
    }

    // Check additions
    for (const [itemPath, proposal] of Object.entries(proposals)) {
      const itemDataPath = itemPathInCR(itemPath, crID);
      const payload: Payload | null = newItemData[itemDataPath]?.data ?? null;
      const preexistingData: Payload | null = origItemData[itemDataPath]?.data ?? null;
      if (isAddition(proposal) && payload) {
        if (payload.identifier > 0) {
          throw new Error("Additions must have negative identifiers at approval time");
        }
        // Increment current identifier
        currentMaxID += 1;
        // Overwrite identifier with next available for this class
        newItemData[itemDataPath]!.data.identifier = currentMaxID;
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
    return `[obj.data?.name ?? '', obj.data?.identifier?.toString(), ...(obj.data?.aliases ?? [])].join('').toLowerCase().indexOf("${quickSearchString.toLowerCase()}") >= 0`;
  },
});
