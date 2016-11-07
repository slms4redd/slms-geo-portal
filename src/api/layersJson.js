import { Layer, Context, Group } from '../config.js'

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
    const xmlhttp = new XMLHttpRequest(),
          url = "../static/layers.json";

    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        const jsonResponse = JSON.parse(this.responseText);
        cb(new _Config(jsonResponse));
      }
    };
    
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  },

  // buyProducts (products, cb, errorCb) {
  //   setTimeout(() => {
  //     // simulate random checkout failure.
  //     (Math.random() > 0.5 || navigator.userAgent.indexOf('PhantomJS') > -1)
  //       ? cb()
  //       : errorCb()
  //   }, 100)
  // }
}
