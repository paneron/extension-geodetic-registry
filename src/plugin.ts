import { makeExtension } from '@riboseinc/paneron-extension-kit';
//import exportPublicSite from '@riboseinc/paneron-registry-kit/site-builder';
import datasetInitializer from '@riboseinc/paneron-registry-kit/migrations/initial';
import mainView from './RepoView';


export default makeExtension({
  mainView,
  name: "Geodetic registry",
  requiredHostAppVersion: "^2.0.0",
  datasetMigrations: {},
  datasetInitializer,
  exportFormats: {
    //['public-site']: {
    //  name: "Public website",
    //  description: "The current version of the register (excluding proposals), rendered in HTML and ready for web serving.",
    //  exporter: exportPublicSite,
    //},
  },
});
