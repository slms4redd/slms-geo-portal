class Layer {
  constructor(layerConfig) {
    this.id = layerConfig.id;
    this.label = layerConfig.label || null;
    this.baseUrl = layerConfig.baseUrl || null;
    this.wmsTime = layerConfig.wmsTime || null;
    this.wmsName = layerConfig.wmsName || null;
    this.imageFormat = layerConfig.imageFormat || 'image/png8';
    this.visible = !!layerConfig.visible;
    this.legend = layerConfig.legend || null;
    this.queryable = !!layerConfig.queryable;
    this.sourceLink = layerConfig.sourceLink || null;
    this.sourceLabel = layerConfig.sourceLabel || null;
    this.type = layerConfig.type || "WMS";
    this.active = false;
  }
}

class Context {
  constructor(contextConfig, layers) {
    this.id = contextConfig.id;
    this.active = !!contextConfig.active;
    this.infoFile = contextConfig.infoFile || null;
    this.label = contextConfig.label;
    const tLayers = contextConfig.layers && contextConfig.layers.map(id => _findById(layers, id))
                                                             // Silently remove nulls (unmatched layers)
                                                             .filter(layer => !!layer);
    this.layers = tLayers || []; 
    this.inlineLegendUrl = contextConfig.inlineLegendUrl || null;
    this.hasLegends = this.layers.some(layer => layer.legend);
  }
}

class Group {
  constructor(groupConfig, contexts) {
    this.label = groupConfig.label;
    this.infoFile = groupConfig.infoFile || null;
    const tItems = groupConfig.items && groupConfig.items.map(item => {
      if (item.context) {
        // Create a dummy ocntext if not found
        return _findById(contexts, item.context) || new Context({ id: item.context, label: item.context });
      }
      return item.group && new Group(item.group, contexts);
    });
    // Silently remove undefined values from array
    this.items = tItems.filter(x => x)
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
}

// const config = new Config(require("./assets/layers.json"));

export { Layer, Context, Group };
