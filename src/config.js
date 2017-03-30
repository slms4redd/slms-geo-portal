import { defaultGeoServerURLs, languages, layersConfigApi as api } from './assets/config.json';
import httpRequest from './httpRequest';
import auth from './auth';

// TODO: Date object handles ISO 8601 on modern browsers
const ISO8601ToDate = function(dateString) {
  const regexp = '([0-9]{4})(-([0-9]{2})(-([0-9]{2})' +
                 '(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\\.([0-9]+))?)?' +
                 '(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?',
        d = dateString.match(new RegExp(regexp));
  if (d) {
    const date = new Date(+d[1], 0, 1);
    let offset = 0;
    if (d[3]) date.setMonth(+d[3] - 1);
    if (d[5]) date.setDate(+d[5]);
    if (d[7]) date.setHours(+d[7]);
    if (d[8]) date.setMinutes(+d[8]);
    if (d[10]) date.setSeconds(+d[10]);
    if (d[12]) date.setMilliseconds(Number('0.' + d[12]) * 1000);
    if (d[14]) {
      offset = (+d[16] * 60) + +d[17];
      offset *= ((d[15] === '-') ? 1 : -1);
    }
    offset -= date.getTimezoneOffset();
    const time = +date + offset * 60 * 1000;

    return new Date(time);
  }
  throw new Error('Invalid date');
};

export function getLocalizedLabels(labelObj, defaultText) {
  labelObj = labelObj || [];
  const ret = [];

  // Get the labels from the label object
  labelObj.forEach(l => {
    if (l.language) ret.push({ language: l.language, label: l.label || defaultText });
  });

  // Add the missing labels, based on the languages array
  languages.forEach(lang => {
    if (!ret.find(l => l.language === lang.id)) {
      ret.push({ language: lang.id, label: defaultText });
    }
  });
  return ret;
}

export class Layer {
  constructor(layerConfig) {
    this.id = Layer.nextId++;
    this.originalId = layerConfig.id;
    this.type = layerConfig.type || 'wms';
    if (this.type === 'wms') {
      this.urls = layerConfig.baseUrl ? [layerConfig.baseUrl] : (defaultGeoServerURLs || null);
      this.name = layerConfig.wmsName || layerConfig.name || null;
      this.imageFormat = layerConfig.imageFormat || 'image/png8';
      this.legend = layerConfig.legend || null; // TODO check structure

      const tTimes = layerConfig.times || [];
      this.times = tTimes.map(time => ({
        iso8601: time,
        humanReadable: time, // TODO - create a humanReadable function
        date: ISO8601ToDate(time) // Used for sorting
      }));

      this.statistics = layerConfig.statistics && layerConfig.statistics.map(s => {
        const ret = {
          type: s.type,
          labels: s.labels
        };
        switch (s.type) {
          case 'url':
            ret.url = s.url;
            break;
          case 'attributes':
            ret.attributes = s.attributes && s.attributes.map(a => ({
              attribute: a.attribute,
              labels: a.labels || a.attribute
            }));
            break;
          default:
            throw new Error(`Unsupported statistics type: ${s.type}`);
        }

        return ret;
      });
    }

    this.visible = layerConfig.visible !== false;
    this.sourceLink = layerConfig.sourceLink || null;
    this.sourceLabel = layerConfig.sourceLabel || null;
  }

  static nextId = 0;
}

class Item {
  constructor(conf) {
    this.id = Item.nextId++;
    this.infoFile = conf.infoFile || null;
    this.labels = getLocalizedLabels(conf.labels);
  }

  findById(id) {
    if (this.id === id) return this;
    if (this.isGroup && this.items) {
      return this.items.reduce((found, item) => found || item.findById(id), null);
    }
  }

  get isGroup() {
    return !!this.items;
  }

  static nextId = 0;

  // static nextId = (function() {
  //   let nextId = 1;
  //   return () => nextId++;
  // })();
}

export class Context extends Item {
  constructor(contextConfig, layers) {
    super(contextConfig);

    // Keeps track of the original id to be used in the Group constructor but creates a new one for internal use
    // The original id can be a String but we use an incremental unique id for contexts and groups
    this.originalId = contextConfig.id;
    this.active = !!contextConfig.active;

    const _findById = (arr, id) => arr.find(item => item.originalId === id);
    const tLayers = contextConfig.layers &&
                    contextConfig.layers.map(id => _findById(layers, id))
                                        .filter(layer => !!layer); // Silently remove nulls (unmatched layers)
    this.layers = tLayers || [];
    this.inlineLegendUrl = contextConfig.inlineLegendUrl || null;
    this.hasLegends = this.layers.some(layer => layer.legend);

    this.times = this.layers.filter(l => l.type === 'wms' && l.times.length)
                            .reduce((contextTimes, l) => contextTimes.concat(l.times), [])
                            // Remove duplicates
                            .filter((elem, pos, arr) => arr.findIndex(el => +el.date === +elem.date) === pos)
                            .sort((t1, t2) => t1.date - t2.date);
  }
}

export class Group extends Item {
  constructor(groupConfig, contexts, parent) {
    super(groupConfig);

    this.parent = parent;
    this.exclusive = !!groupConfig.exclusive;
    const tItems = (groupConfig.items || []).map(item => {
      if (item.context) {
        // Create a dummy context if not found
        const context = contexts.find(c => c.originalId === item.context) ||
                        new Context({ id: item.context, label: item.context });
        context.parent = this;

        return context;
      }
      return item.group && new Group(item.group, contexts, this);
    });
    // Silently remove undefined values (unmatched contexts) from the array
    this.items = tItems.filter(x => x);
  }
}

class _Config {
  constructor(json) {
    this.layers = json.layers.map(layerConf => new Layer(layerConf));
    this.contexts = json.contexts.map(contextConf => new Context(contextConf, this.layers));
    this.groups = new Group(json.group, this.contexts, null);
  }
}

export function getLayers(lang, cb) {
  return new Promise((resolve, reject) => {
    // httpRequest('GET', '../static/configuration/layers.json')
    //   .then(responseText => resolve(new _Config(JSON.parse(responseText))))
    //   .catch(error => reject(error.statusText || error.message));
    const url = api.baseUrl + api.getLayersConfigUrl;
    httpRequest('GET', url)
      .then(responseText => resolve(new _Config(JSON.parse(responseText))))
      .catch(error => reject(error.statusText || error.message));
  });
}

export function saveConfiguration(conf) {
  return new Promise((resolve, reject) => {
    const url = api.baseUrl + api.saveLayersConfigUrl;
    httpRequest('POST', url, serializeConfiguration(conf), [['Content-Type', 'application/json'], ['Authorization', auth.getAuthToken()]])
      .then(responseText => resolve())
      .catch(error => reject(error));
  });
}

export function getConfigurationHistory() {
  return new Promise((resolve, reject) => {
    const url = api.baseUrl + api.getLayersConfigHisoryUrl;
    httpRequest('GET', url, null, [['Authorization', auth.getAuthToken()]])
      .then(responseText => resolve(JSON.parse(responseText)))
      .catch(error => reject(error));
  });
}

export function restoreVersion(version) {
  const url = api.baseUrl + api.restoreVersionUrl + '?version=' + version;
  // return new Promise((resolve, reject) => {
  //   httpRequest('GET', url)
  //     .then(responseText => resolve(JSON.parse(responseText)))
  //     .catch(error => reject(error));
  // });
  return httpRequest('GET', url, null, [['Authorization', auth.getAuthToken()]]);
}

const serializeConfiguration = function(conf) {
  // Clean up before exporting
  const layerReplacer = (key, value) => {
    switch (key) {
      case 'originalId': // TODO the originalId attribute will be removed
      case 'urls':
        return undefined;
      case 'legend':
      case 'sourceLink':
      case 'sourceLabel':
        return value || undefined;
      case 'times':
        const t = value.map(t => t.iso8601);
        return t.length ? t : undefined;
      default:
        return value;
    }
  };
  const layers = JSON.parse(JSON.stringify(conf.layers, layerReplacer));

  const contextReplacer = (key, value) => {
    switch (key) {
      case 'layers':
        return value.length ? value.map(l => l.id) : undefined;
      case 'inlineLegendUrl':
      case 'infoFile':
        return value || undefined;
      case 'parent':
      case 'hasLegends':
      case 'times':
      case 'originalId': // TODO the originalId attribute will be removed
        return undefined;
      default:
        return value;
    }
  };
  const contexts = JSON.parse(JSON.stringify(conf.contexts, contextReplacer));

  const groupReplacer = (key, value) => {
    switch (key) {
      case '': // Root
        // Remove the label attribute
        return {
          exclusive: value.exclusive,
          items: value.items
        };
      case 'id':
      case 'parent':
        return undefined;
      case 'infoFile':
        return value || undefined;
      case 'items':
        if (value.length === 0) return undefined;
        return value.map(i => {
          if (i.items) return { group: i };
          else return { context: i.id };
        });
      default:
        return value;
    }
  };
  const group = JSON.parse(JSON.stringify(conf.groups, groupReplacer));

  const obj = {
    $schema: '../../layersJsonSchema_v2.json', // TODO
    layers: layers,
    contexts: contexts,
    group: group
  };

  return JSON.stringify(obj);
};

// export { Layer, Context, Group };
