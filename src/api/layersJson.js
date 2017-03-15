import { Layer, Context, Group } from '../config.js';
import httpRequest from '../httpRequest';

const setGroupsIds = function(group, id) {
  (function setGroupId(item) {
    if (!item.id) item.id = id++;
    if (item.items) item.items.forEach(g => setGroupId(g));
  })(group);
};

class _Config {
  constructor(json) {
    this.layers = json.layers.map(layerConf => new Layer(layerConf));
    this.contexts = json.contexts.map(contextConf => new Context(contextConf, this.layers));
    this.groups = new Group(json.contextGroups, this.contexts);

    // Add unique id to groups, only needed by v-for
    const minGroupId = Math.max.apply(null, this.contexts.map(c => +c.id || 0)) + 1;
    setGroupsIds(this.groups, minGroupId);
  }
}

export default {
  getLayers(lang, cb) {
    return new Promise(function(resolve, reject) {
      // To keep the compatibility with the old portal, layers.json can be localized
      const url = '../static/configuration/layers.json' + (lang ? `?lang=${lang}` : '');
      httpRequest('GET', url)
        .then(responseText => resolve(new _Config(JSON.parse(responseText))))
        .catch(error => reject(error.statusText || error.message));
    });
  }
};
