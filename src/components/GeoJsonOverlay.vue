<template>
  <div v-if="geoJsonOverlay" id="outer">
    <div id="message">
      <div><b>Message:</b> {{geoJsonOverlay.message}}</div>
      <button @click="clearFeedback" class="small" id="clearButton">Clear</button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import map from '../map'

let vectorLayer;

export default {
  methods: {
    clearFeedback() {
      this.$store.commit('overlay_geojson', { geoJson: null });
    }
  },
  watch: {
    geoJsonOverlay(geojsonObject) {
      if (geojsonObject) {
        let vectorSource = new ol.source.Vector({
          features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)
        });

        vectorLayer = new ol.layer.Vector({
          source: vectorSource
        });

        // Make sure it stays on top
        vectorLayer.setZIndex(1000);
        map.addLayer(vectorLayer);

        var extent = vectorSource.getExtent();
        map.getView().fit(extent, map.getSize());
      } else {
        map.removeLayer(vectorLayer);
      }
    }
  },
  computed: mapGetters([
    'geoJsonOverlay'
  ])
}
</script>

<style scoped>
#outer {
  text-align: center;
}
#message {
  background: rgba(0, 0, 0, 0.66);
  padding: 10px;
  font-size: 14px;
  position: relative;
  bottom: 100px;
  color: white;
  text-shadow: black 0 0 2px;
  max-width: 50%;
  display: inline-block;
}
#clearButton {
  margin-top: 10px;
}
</style>
