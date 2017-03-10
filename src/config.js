import { defaultGeoServerURLs } from './assets/config.json';

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
    this.label = layerConfig.label || null;
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
          case 'iframe': // TODO backward compatibility - delete it
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

class Context {
  constructor(contextConfig, layers) {
    this.id = contextConfig.id;
    this.active = !!contextConfig.active;
    this.infoFile = contextConfig.infoFile || null;
    this.label = contextConfig.label;
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

class Group {
  constructor(groupConfig, contexts) {
    this.label = groupConfig.label;
    this.infoFile = groupConfig.infoFile || null;
    this.exclusive = !!groupConfig.exclusive;
    const tItems = groupConfig.items && groupConfig.items.map(item => {
      if (item.context) {
        // Create a dummy context if not found
        const context = _findById(contexts, item.context) || new Context({ id: item.context, label: item.context });
        context.group = this;
        return context;
      }
      return item.group && new Group(item.group, contexts);
    });
    // Silently remove undefined values (unmatched contexts) from the array
    this.items = tItems.filter(x => x);
  }
}

const _findById = (arr, id) => arr.find(item => item.id === id);

export { Layer, Context, Group };
