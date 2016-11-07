<template>
  <div id="map"></div>
</template>

<script>
import { config } from '../config';
import bus from '../bus';
import OlLayerFactory from '../olLayerFactory';
import { mapGetters } from 'vuex'

const map = new ol.Map({
  controls: ol.control.defaults({
    attributionOptions: ({ collapsible: false })
  }),
  view: new ol.View({
    center: ol.proj.fromLonLat([37.41, 8.82]),
    zoom: 4
  })
});

const addOlLayer = function(layer) {
  const l = OlLayerFactory.createOlLayer(layer);
  if (l) {
    map.addLayer(l);
  }
  return l;
}

export default {
  name: 'mapPane',
  mounted() {
    map.setTarget('map');
  },

  watch: {
    layersTree: function(layers) {
      this.layersTree.layers.forEach(layerConfig => {
        try {
          const olLayer = addOlLayer(layerConfig);
          if (olLayer) {
            bus.$on('context-toggled', (context, visible) => {
              const layerIds = context.layers.map(layer => layer.id);
              if (layerIds.includes(layerConfig.id)) {
                olLayer.setVisible(visible && layerConfig.visible);
              }
            });
          }
        } catch (e) {
          console.log(e);
        }
      });
      // bus.$emit('map-mounted', map);
    }
  },

  computed: mapGetters([
    'layersTree'
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
  top: $banner-height + 5px;
}
.ol-dragzoom {
  border-color: #999;
  border-width: 2px;
  border-style: dashed;
}
</style>
