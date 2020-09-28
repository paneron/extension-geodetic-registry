import { Plugin } from '@riboseinc/paneron-plugin-kit/types';
import 'electron';


let plugin: Plugin;

if (process.type === 'browser') {
  plugin = {};

} else if (process.type === 'renderer') {
  plugin = {
    repositoryView: import('./RepoView').then(value => value.RepositoryView),
  };

} else {
  throw new Error("Unsupported process type");

}

export default plugin;
