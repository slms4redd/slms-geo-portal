<template>
  <div id="map"></div>
</template>

<script>
import { config } from '../config'

let map;

export default {
  name: 'mapPane',
  
  mounted() {
    map = new ol.Map({
      target: 'map',
      layers: [
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([37.41, 8.82]),
        zoom: 4
      })
    });

    config.layers.forEach(layer => {
      let attributions = [];
      if (layer.sourceLink) {
        attributions.push(new ol.Attribution({ html: `<a href="${layer.sourceLink}">${layer.sourceLabel || layer.sourceLink}</a>` }));
      }

      var olLayer = new ol.layer.Tile({
        // extent: [2033814, 6414547, 2037302, 6420952],
        // preload: Infinity,
        visible: layer.active,
        source: new ol.source.TileWMS(({
          url: layer.baseUrl,
          params: {
            'LAYERS': layer.wmsName,
            'TILED': true,
            'VERSION': '1.3.0',
            'FORMAT': layer.imageFormat || 'image/png8',
            'WIDTH': 256,
            'HEIGHT': 256,
            'CRS': 'EPSG:900913'
          },
          serverType: 'geoserver',
          attributions: attributions
        }))
      });

      map.addLayer(olLayer);
    })
  },

  methods: {
    // addLayer(layer) { map.addLayer(layer); }
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
</style>
