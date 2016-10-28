<template>
  <div id="map"></div>
</template>

<script>
import { config } from '../config';
import bus from '../bus';

let map;
const attributions = [];

const addOlLayer = function(layer) {
  let source;
  switch(layer.type) {
    case 'OSM':
      source = new ol.source.OSM();
      break;
    default:
      const olAttributions = [];
      if (layer.sourceLink) {
        let source = attributions[layer.sourceLabel] || new ol.Attribution({ html: `<a href="${layer.sourceLink}">${layer.sourceLabel || layer.sourceLink}</a>` });
        attributions[layer.sourceLabel] = source;
        olAttributions.push(source);
      }
      source = new ol.source.TileWMS(({
        url: layer.baseUrl,
        params: {
          'LAYERS': layer.wmsName,
          'TILED': true,
          'VERSION': '1.3.0',
          'FORMAT': layer.imageFormat,
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
      // extent: [2033814, 6414547, 2037302, 6420952],
      // preload: Infinity,
      visible: layer.active,
      source: source
    });
    map.addLayer(olLayer);
    
    return olLayer;
  }
}

export default {
  name: 'mapPane',
  mounted() {
    map = new ol.Map({
      controls: ol.control.defaults({
        attributionOptions: ({ collapsible: false })
      }),
      target: 'map',
      view: new ol.View({
        center: ol.proj.fromLonLat([37.41, 8.82]),
        zoom: 4
      })
    });

    config.layers.forEach(layerConfig => {
      try {
        const olLayer = addOlLayer(layerConfig);

        if (olLayer) {
          bus.$on('context-toggled', function (context, visible) {
            const layerIds = context.layers.map(layer => layer.id);
            if (layerIds.includes(layerConfig.id)) {
              olLayer.setVisible(visible && layerConfig.visible);
            }
          })
        }
      } catch (e) {
        console.log(e);
      }
    })
  }
}
</script>

<style scoped>
#map {
  height: 100%;
  width: 100%;
}
</style>

<style lang="scss">
@import "../assets/global.scss";

.ol-zoom {
  top: $banner-height + 5px;
}
.ol-dragzoom {
  border-color: #999;
  border-width: 2px;
  border-style: dashed;
}
</style>
