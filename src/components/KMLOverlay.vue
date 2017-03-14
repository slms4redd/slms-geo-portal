<template>
  <div v-if="kmlOverlay" id="outer">
    <div id="message">
      <!-- <div><b>Message:</b> {{kmlOverlay.message}}</div> -->
      <button @click="clearFeedback" class="small" id="clearButton">{{$t("kmlOverlay.clear")}}</button>
    </div>
  </div>
</template>

<script>
/* global ol */

import { mapState } from 'vuex';
import map from '../map';

let vectorLayer;

export default {
  methods: {
    clearFeedback() { this.$store.commit('overlay_kml', { kml: null }) }
  },
  watch: {
    kmlOverlay(kml) {
      map.removeLayer(vectorLayer);
      if (kml) {
        const vectorSource = new ol.source.Vector({
          features: (new ol.format.KML({ extractStyles: false })).readFeatures(kml, { featureProjection: 'EPSG:3857' })
        });

        const stroke = new ol.style.Stroke({
          color: '#319FD3',
          width: 1
        });
        const fill = new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.3)'
        });
        const circle = new ol.style.Circle({
          fill: fill,
          stroke: stroke,
          radius: 5
        });

        const defaultStyle = {
          'Point': new ol.style.Style({
            image: circle
          }),
          'LineString': new ol.style.Style({
            stroke: stroke
          }),
          'Polygon': new ol.style.Style({
            fill: fill,
            stroke: stroke
          }),
          'MultiPoint': new ol.style.Style({
            image: circle
          }),
          'MultiLineString': new ol.style.Style({
            stroke: stroke
          }),
          'MultiPolygon': new ol.style.Style({
            fill: fill,
            stroke: stroke
          })
        };

        const styleFunction = function(feature, resolution) {
          const featureStyleFunction = feature.getStyleFunction();
          if (featureStyleFunction) {
            return featureStyleFunction.call(feature, resolution);
          }
          return defaultStyle[feature.getGeometry().getType()];
        };

        vectorLayer = new ol.layer.Vector({
          source: vectorSource,
          style: styleFunction
        });

        // Make sure it stays on top
        vectorLayer.setZIndex(1000);
        map.addLayer(vectorLayer);
        map.getView().fit(vectorSource.getExtent(), map.getSize());
      }
    }
  },
  computed: mapState([
    'kmlOverlay'
  ])
};
</script>

<style scoped>
#outer {
  text-align: center;
}
#message {
  position: relative;
  bottom: 70px;
}
#clearButton {
  margin-top: 10px;
}
</style>
