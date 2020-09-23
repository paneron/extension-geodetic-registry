import { Plugin } from './types';
import 'electron';


let plugin: Plugin;

if (process.type === 'browser') {
  plugin = {};

} else if (process.type === 'renderer') {
  plugin = {
    repositoryView: import('./RepoView').then(value => value.RepoView),
  };

} else {
  throw new Error("Unsupported process type");

}

export default plugin;
