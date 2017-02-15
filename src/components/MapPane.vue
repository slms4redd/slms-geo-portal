<template>
  <div id="map"></div>
</template>

<script>
import OlLayerFactory from '../olLayerFactory';
import { mapGetters } from 'vuex'
import map from '../map';

const olLayers = {}

export default {
  name: 'mapPane',
  mounted() {
    map.setTarget('map');
  },

  watch: {
    layers(layers) {
      layers.forEach(layerConfig => {
        try {
          const olLayer = OlLayerFactory.createOlLayer(layerConfig);
          if (olLayer) {
            olLayers[layerConfig.id] = olLayer;
            map.addLayer(olLayer);
          }
        } catch (e) {
          console.log(e);
        }
      });
    },
    activeLayers(activeLayers) {
      this.layers.forEach(l =>
        olLayers[l.id].setVisible(l.visible && activeLayers.find(a => a.id === l.id)));
    },
    contextsTimes(contextsTimes) {
      for (let contextId in contextsTimes) {
        if (contextsTimes.hasOwnProperty(contextId) && contextsTimes[contextId]) {
          const context = this.contexts.find(c => c.id === contextId);
          context.layers.forEach(l =>
            olLayers[l.id].getSource().updateParams({'TIME': contextsTimes[contextId].date.toISOString()}));
        }
      }
    },
    geoJsonOverlay(geojsonObject) {
      // TODO
      var vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)
      });

      var vectorLayer = new ol.layer.Vector({
        source: vectorSource
      });

      // Make sure it stays on top
      vectorLayer.setZIndex(1000);
      map.addLayer(vectorLayer);
    } 
  },

  computed: mapGetters([
    'layers',
    'contexts',
    'activeLayers',
    'contextsTimes',
    'geoJsonOverlay'
  ])
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
  top: $banner-height + 8px;
  right:.5em;
  left: initial;
}
/*.ol-control button.ol-zoom-in, .ol-control button {
  outline: none;
}*/
.ol-dragzoom {
  border-color: #999;
  border-width: 2px;
  border-style: dashed;
}
</style>
