<template>
  <div id="map"></div>
</template>

<script>
import { config } from '../config';
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

const olLayersMap = {}

export default {
  name: 'mapPane',
  mounted() {
    map.setTarget('map');
  },

  watch: {
    layers: {
      handler: function(layers) {
        layers.forEach(layerConfig => {
          try {
            const l = OlLayerFactory.createOlLayer(layerConfig);
            if (l) {
              olLayersMap[layerConfig.id] = l;
              map.addLayer(l);
            }
          } catch (e) {
            console.log(e);
          }
        });
        this.$watch('contexts', function(contexts) {
          // loop through all context and layers to set ol layer visibility
          contexts.forEach(context => {
            context.layers.forEach(layer => {
              olLayersMap[layer.id].setVisible(context.active && layer.visible)
            });
          });
        }, 
        { deep: true });
      }
    },
    // contexts: {
    //   handler: function(context) {
    //     alert ('aaa')
    //   },
    //   deep: true
    // }
  },

  computed: mapGetters([
    'layers',
    'contexts'
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
