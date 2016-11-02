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
          let source = attributions[layerConfig.sourceLabel] || new ol.Attribution({ html: `<a href="${layerConfig.sourceLink}">${layerConfig.sourceLabel || layerConfig.sourceLink}</a>` });
          attributions[layerConfig.sourceLabel] = source;
          olAttributions.push(source);
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
      const olLayer = new ol.layer.Tile({
        visible: layerConfig.active,
        source: source
      });
      
      return olLayer;
    }
  }
}

export default OlLayerFactory;
