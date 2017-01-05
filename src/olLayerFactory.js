import { bingMapsKey } from './assets/config.json';

const attributions = [];

const _getStyle = function(styleDef) {
  if (styleDef) {
    let stroke, fill;
    if (styleDef.stroke) {
      stroke = new ol.style.Stroke(styleDef.stroke);
    }
    if (styleDef.fill) {
      fill = new ol.style.Fill(styleDef.fill);
    }
    return new ol.style.Style({ stroke: stroke, fill: fill });
  } else {
    return new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#000000',
        width: 1
      })
    });
  }
}

class OlLayerFactory {
  static createOlLayer(layerConfig) {
    let source;

    switch(layerConfig.type) {
      case 'OSM':
        source = new ol.source.OSM();
        break;
      case 'bing-aerial':
        source = new ol.source.BingMaps({
          key: bingMapsKey,
          imagerySet: 'Aerial'
          // use maxZoom 19 to see stretched tiles instead of the BingMaps
          // "no photos at this zoom level" tiles
          // maxZoom: 19
        });
        break;
      case 'vectorTiles':
      case 'WMS':
        const olAttributions = [];
        if (layerConfig.sourceLink) {
          let attribution = attributions[layerConfig.sourceLabel];
          if (!attribution) {
            attribution = new ol.Attribution({
              html: `<a href="${layerConfig.sourceLink}">${layerConfig.sourceLabel || layerConfig.sourceLink}</a>`
            });
          }
          attributions[layerConfig.sourceLabel] = attribution;
          olAttributions.push(attribution);
        }
        if (layerConfig.type === 'WMS') {
          source = new ol.source.TileWMS(({
            urls: layerConfig.urls,
            params: {
              'LAYERS': layerConfig.name,
              'TILED': true,
              'VERSION': '1.3.0',
              'FORMAT': layerConfig.imageFormat,
              'WIDTH': 256,
              'HEIGHT': 256,
              'CRS': 'EPSG:3857'
            },
            serverType: 'geoserver',
            attributions: olAttributions
          }));
        } else {
          source = new ol.source.VectorTile({
            tilePixelRatio: 1, // oversampling when > 1
            tileGrid: ol.tilegrid.createXYZ({maxZoom: 19}),
            format: new ol.format.MVT(),
            url: `http://localhost:8080/local-gs/gwc/service/tms/1.0.0/${layerConfig.name}@EPSG%3A${3857}@pbf/{z}/{x}/{-y}.pbf`,
            attributions: olAttributions
          });
        }
        break;
    }

    if (source) {
      if (layerConfig.type !== 'vectorTiles') {
        return new ol.layer.Tile({
          visible: false, // will be set by the activeLayers watch in MapPane
          source: source
        });
      } else {
        const olStyle = _getStyle(layerConfig.style);

        return new ol.layer.VectorTile({
          style: feature => olStyle,
          source: source
        })
      }
    }
  }
}

export default OlLayerFactory;
