const attributions = [];

class OlLayerFactory {
  static createOlLayer(layerConfig) {
    let source;

    switch(layerConfig.type) {
      case 'OSM':
        source = new ol.source.OSM();
        break;
      case 'bing-aerial':
        source = new ol.source.BingMaps({
          key: require("./assets/config.json").bingMapsKey,
          imagerySet: 'Aerial'
          // use maxZoom 19 to see stretched tiles instead of the BingMaps
          // "no photos at this zoom level" tiles
          // maxZoom: 19
        });
        break;
      default:
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
        source = new ol.source.TileWMS(({
          url: layerConfig.baseUrl,
          params: {
            'LAYERS': layerConfig.wmsName,
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
    }
    if (source) {
      return new ol.layer.Tile({
        visible: layerConfig.active,
        source: source
      });
    }
  }
}

export default OlLayerFactory;
