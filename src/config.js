import { defaultGeoServerURLs } from './assets/config.json';
import httpRequest from './httpRequest';

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

class Layer {
  constructor(layerConfig) {
    this.type = layerConfig.type || 'WMS';
    this.id = layerConfig.id;
    // this.label = layerConfig.label || null;
    if (this.type === 'WMS') {
      this.urls = layerConfig.baseUrl ? [layerConfig.baseUrl] : (defaultGeoServerURLs || null);
      this.name = layerConfig.wmsName || layerConfig.name || null;
      this.imageFormat = layerConfig.imageFormat || 'image/png8';
      this.legend = layerConfig.legend || null; // TODO check structure

      const tTimes = layerConfig.wmsTime ? layerConfig.wmsTime.split(',') : [];
      this.times = tTimes.map(time => ({
        humanReadable: time,
        date: ISO8601ToDate(time)
      }));

      this.statistics = layerConfig.statistics && layerConfig.statistics.map(s => {
        const ret = {
          type: s.type,
          popupLabel: s.popupLabel
        };
        switch (s.type) {
          case 'url':
            ret.url = s.url;
            break;
          case 'attributes':
            ret.attributes = s.attributes && s.attributes.map(a => ({
              attribute: a.attribute,
              label: a.label || a.attribute
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
}

class Item {
  constructor(conf) {
    this.id = Item.nextId();
    this.infoFile = conf.infoFile || null;
    this.label = conf.label;
  }

  findById(id) {
    if (this.id === id) return this;
    if (this.isGroup && this.items) {
      return this.items.reduce((found, item) => found || item.findById(id), null);
    }
  }

  isGroup() {
    return !!this.items;
  }

  static nextId = (function() {
    let nextId = 1;
    return () => nextId++;
  })();
}

export class Context extends Item {
  constructor(contextConfig, layers) {
    super(contextConfig);

    // Keeps track of the original id to be used in the Group constructor but creates a new one for internal use
    // The original id can be a String but we use an incremental unique id for contexts and groups
    this.originalId = contextConfig.id;
    this.active = !!contextConfig.active;

    const _findById = (arr, id) => arr.find(item => item.id === id);
    const tLayers = contextConfig.layers && contextConfig.layers.map(id => _findById(layers, id))
                                                                .filter(layer => !!layer); // Silently remove nulls (unmatched layers)
    this.layers = tLayers || [];
    this.inlineLegendUrl = contextConfig.inlineLegendUrl || null;
    this.hasLegends = this.layers.some(layer => layer.legend);

    this.times = this.layers.filter(l => l.type === 'WMS' && l.times.length)
                            .reduce((contextTimes, l) => contextTimes.concat(l.times), [])
                            // Remove duplicates
                            .filter((elem, pos, arr) => arr.findIndex(el => +el.date === +elem.date) === pos)
                            .sort((t1, t2) => t1.date - t2.date);
  }
}

export class Group extends Item {
  constructor(groupConfig, contexts) {
    super(groupConfig);

    this.exclusive = !!groupConfig.exclusive;
    const tItems = groupConfig.items && groupConfig.items.map(item => {
      if (item.context) {
        // Create a dummy context if not found
        const context = contexts.find(c => c.originalId === item.context) ||
                        new Context({ id: item.context, label: item.context });
        context.group = this;

        return context;
      }
      return item.group && new Group(item.group, contexts);
    });
    // Silently remove undefined values (unmatched contexts) from the array
    this.items = tItems ? tItems.filter(x => x) : [];
  }
}

class _Config {
  constructor(json) {
    this.layers = json.layers.map(layerConf => new Layer(layerConf));
    this.contexts = json.contexts.map(contextConf => new Context(contextConf, this.layers));
    this.groups = new Group(json.contextGroups, this.contexts);
  }

  serialize() {
    // Clean up before exporting
    const layerReplacer = (key, value) => {
      // TODO: urls should be removed if same as the default one
      switch (key) {
        case 'legend':
        case 'sourceLink':
        case 'sourceLabel':
          return value || undefined;
        default:
          return value;
      }
    };
    const layers = JSON.parse(JSON.stringify(this.layers, layerReplacer));

    const contextReplacer = (key, value) => {
      switch (key) {
        case 'layers':
          if (value.length === 0) return undefined;
          return value.map(l => l.id);
        case 'inlineLegendUrl':
        case 'infoFile':
          return value || undefined;
        case 'group':
        case 'hasLegends':
        case 'times':
          return undefined;
        default:
          return value;
      }
    };
    const contexts = JSON.parse(JSON.stringify(this.contexts, contextReplacer));

    const groupReplacer = (key, value) => {
      switch (key) {
        case 'id':
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
    const groups = JSON.parse(JSON.stringify(this.groups, groupReplacer));

    const obj = {
      layers: layers,
      contexts: contexts,
      groups: groups
    };

    return JSON.stringify(obj, null, '  ');
  }
}

export function getLayers(lang, cb) {
  return new Promise(function(resolve, reject) {
    // To keep the compatibility with the old portal, layers.json can be localized
    const url = '../static/configuration/layers.json' + (lang ? `?lang=${lang}` : '');
    httpRequest('GET', url)
      .then(responseText => resolve(new _Config(JSON.parse(responseText))))
      .catch(error => reject(error.statusText || error.message));
  });
}

// export { Layer, Context, Group };
