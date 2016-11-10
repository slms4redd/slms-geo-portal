import { Layer, Context, Group } from '../config.js'
import httpRequest from '../httpRequest'

class _Config {
  constructor(json) {
    this.layers = json.layers.map(layerConf => new Layer(layerConf));
    this.contexts = json.contexts.map(contextConf => new Context(contextConf, this.layers));
    this.contexts.forEach(context => context.layers.forEach(layer => {
      layer.active = context.active;
    }));
    this.groups = new Group(json.contextGroups, this.contexts);
  }
}

export default {
  getLayers(cb) {
    httpRequest('../static/layers.json', (responseText) => {
      try {
        cb(new _Config(JSON.parse(responseText)));
      } catch(e) {
        alert(e);
      }
    }, (error) => {
      alert(error);
    });
  }
}
