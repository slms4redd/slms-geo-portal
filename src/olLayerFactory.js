const attributions = [];

class OlLayerFactory {
  static createOlLayer(layerConfig) {
    let source;

    switch(layerConfig.type) {
      case 'OSM':
        source = new ol.source.OSM();
        break;
      default:
        const olAttributions = [];
        if (layerConfig.sourceLink) {
          let attribution = attributions[layerConfig.sourceLabel];
          if (!attribution) {
            attribution = new ol.Attribution({ html: `<a href="${layerConfig.sourceLink}">${layerConfig.sourceLabel || layerConfig.sourceLink}</a>` });
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
