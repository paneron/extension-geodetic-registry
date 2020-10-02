import { Plugin } from '@riboseinc/paneron-extension-kit/types';
import log from 'electron-log';
import 'electron';


let plugin: Plugin;

if (process.type === 'browser') {
  plugin = {};

} else if (process.type === 'renderer') {
  plugin = new Promise((resolve, reject) => {
    import('./RepoView').then(({ RepositoryView }) => {
      resolve({
        repositoryView: RepositoryView,
      });
    }).catch((e) => {
      log.error("Geodetic Registry plugin: Error loading repository view", JSON.stringify(e));
      reject(e);
    });
  });

} else {
  throw new Error("Unsupported process type");

}

export default plugin;
