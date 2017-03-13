import { Layer, Context, Group } from '../config.js';
import httpRequest from '../httpRequest';

const setGroupsIds = function(group, ids) {
  if (!group.id) {
    group.id = ids.reduce((max, val) => Math.max(max, +val || 0), 0) + 1;
    ids.push(group.id);
  }
  if (group.items) group.items.forEach(g => setGroupsIds(g, ids));
};

class _Config {
  constructor(json) {
    this.layers = json.layers.map(layerConf => new Layer(layerConf));
    this.contexts = json.contexts.map(contextConf => new Context(contextConf, this.layers));
    // this.contexts.forEach(context =>
    //   context.layers.forEach(layer =>
    //     layer.active = context.active));
    this.groups = new Group(json.contextGroups, this.contexts);

    // Add unique id to groups, for use with v-for
    setGroupsIds(this.groups, this.contexts.map(c => c.id));
  }
}

export default {
  getLayers(lang, cb) {
    // To keep the compatibility with the old portal, layers.json can be localized
    const url = '../static/configuration/layers.json' + (lang ? `?lang=${lang}` : '');

    httpRequest('GET', url)
    .then(responseText => cb(new _Config(JSON.parse(responseText))))
    .catch(error => {
      alert(error.statusText || error.message);
    });
  }
};
