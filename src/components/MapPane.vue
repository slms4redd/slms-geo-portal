<template>
  <div id="map"></div>
</template>

<script>
import { config } from '../config';
import bus from '../bus';

let map;

const addOlLayer = function(layer) {
  let attributions = [];
  if (layer.sourceLink) {
    attributions.push(new ol.Attribution({ html: `<a href="${layer.sourceLink}">${layer.sourceLabel || layer.sourceLink}</a>` }));
  }

  let source;
  switch(layer.type) {
    case 'OSM':
      source = new ol.source.OSM();
      break;
    default:
      source = new ol.source.TileWMS(({
        url: layer.baseUrl,
        params: {
          'LAYERS': layer.wmsName,
          'TILED': true,
          'VERSION': '1.3.0',
          'FORMAT': layer.imageFormat,
          'WIDTH': 256,
          'HEIGHT': 256,
          'CRS': 'EPSG:900913'
        },
        serverType: 'geoserver',
        attributions: attributions
      }));
  }

  if (source) {
    var olLayer = new ol.layer.Tile({
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
  data() {
    return { olLayers: {} }
  },
  mounted() {
    map = new ol.Map({
      target: 'map',
      view: new ol.View({
        center: ol.proj.fromLonLat([37.41, 8.82]),
        zoom: 4
      })
    });

    config.layers.forEach(layerDefinition => {
      try {
        let olLayer = addOlLayer(layerDefinition);

        if (olLayer) {
          bus.$on('layer-toggled', function (id, visible) {
            if (id === layerDefinition.id) {
              olLayer.setVisible(visible && layerDefinition.visible);
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
