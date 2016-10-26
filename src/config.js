class Layer {
  constructor(layerConfig) {
    this.id = layerConfig.id;
    this.label = layerConfig.label;
    this.baseUrl = layerConfig.baseUrl;
    this.wmsTime = layerConfig.wmsTime;
    this.wmsName = layerConfig.wmsName;
    this.imageFormat = layerConfig.imageFormat;
    this.visible = layerConfig.visible;
    this.legend = layerConfig.legend;
    this.queryable = layerConfig.queryable;
    this.sourceLink = layerConfig.sourceLink;
    this.sourceLabel = layerConfig.sourceLabel;
    this.type = "WMS";
    this.active = false;
  }
}

class Context {
  constructor(contextConfig, layers) {
    this.id = contextConfig.id;
    this.active = !!contextConfig.active;
    this.infoFile = contextConfig.infoFile;
    this.label = contextConfig.label;
    var layers = contextConfig.layers && contextConfig.layers.map(id => _findById(layers, id))
                                                             .filter(layer => !!layer); // remove nulls
    this.layers = layers || []; 
    this.inlineLegendUrl = contextConfig.inlineLegendUrl;
  }
}

class Group {
  constructor(groupConfig, contexts) {
    this.label = groupConfig.label;
    this.infoFile = groupConfig.infoFile;
    this.items = groupConfig.items && groupConfig.items.map(item => {
      if (item.context) {
        return _findById(contexts, item.context);
      } else if (item.group) {
        return new Group(item.group, contexts);
      } else {
        return null;
      }
    });
  }
}

const _findById = (arr, id) => arr.find(item => item.id === id);

class Config {
  constructor(json) {
    this.layers = json.layers.map(layerConf => new Layer(layerConf));
    this.contexts = json.contexts.map(contextConf => new Context(contextConf, this.layers));
    this.contexts.forEach(context => context.layers.forEach(layer => {
      layer.active = context.active;
    }));
    this.groups = new Group(json.contextGroups, this.contexts);
  }

  layer(id) {
    return _findById(this.layers, id)
  }
}

let config = new Config(require("./assets/layers.json"));

export { config, Layer, Context, Group };
