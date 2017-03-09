<template>
  <div v-if="kmlOverlay" id="outer">
    <div id="message">
      <!-- <div><b>Message:</b> {{kmlOverlay.message}}</div> -->
      <button @click="clearFeedback" class="small" id="clearButton">Clear</button>
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
    clearFeedback() {
      this.$store.commit('overlay_kml', { kml: null });
    }
  },
  watch: {
    kmlOverlay(kml) {
      map.removeLayer(vectorLayer);
      if (kml) {
        // Delete any other previous overlay

        const vectorSource = new ol.source.Vector({
          features: (new ol.format.KML({ extractStyles: false })).readFeatures(kml, { featureProjection: 'EPSG:3857' })
        });

        const defaultStyle = {
          'Point': new ol.style.Style({
            image: new ol.style.Circle({
              fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.3)'
              }),
              radius: 5,
              stroke: new ol.style.Stroke({
                color: '#319FD3',
                width: 1
              })
            })
          }),
          'LineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: '#319FD3',
              width: 1
            })
          }),
          'Polygon': new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'rgba(255, 255, 255, 0.3)'
            }),
            stroke: new ol.style.Stroke({
              color: '#319FD3',
              width: 1
            })
          }),
          'MultiPoint': new ol.style.Style({
            image: new ol.style.Circle({
              fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.3)'
              }),
              radius: 5,
              stroke: new ol.style.Stroke({
                color: '#319FD3',
                width: 1
              })
            })
          }),
          'MultiLineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: '#319FD3',
              width: 1
            })
          }),
          'MultiPolygon': new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'rgba(255, 255, 255, 0.3)'
            }),
            stroke: new ol.style.Stroke({
              color: '#319FD3',
              width: 1
            })
          })
        };

        const styleFunction = function(feature, resolution) {
          const featureStyleFunction = feature.getStyleFunction();
          if (featureStyleFunction) {
            return featureStyleFunction.call(feature, resolution);
          } else {
            return defaultStyle[feature.getGeometry().getType()];
          }
        };

        // const style = new ol.style.Style({
        //   fill: new ol.style.Fill({
        //     color: 'rgba(255, 255, 255, 0.4)'
        //   }),
        //   stroke: new ol.style.Stroke({
        //     color: '#319FD3',
        //     width: 1
        //   })
        // });

        vectorLayer = new ol.layer.Vector({
          source: vectorSource,
          style: styleFunction
        });

        // Make sure it stays on top
        vectorLayer.setZIndex(1000);
        map.addLayer(vectorLayer);

        let extent = vectorSource.getExtent();
        map.getView().fit(extent, map.getSize());
      } else {
        map.removeLayer(vectorLayer);
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
  /* background: rgba(0, 0, 0, 0.66);
  padding: 10px;
  font-size: 14px; */
  position: relative;
  bottom: 70px;
  /* color: white;
  text-shadow: black 0 0 2px;
  min-width: 180px;
  max-width: 50%;
  display: inline-block;
  border-radius: 5px; */
}
#clearButton {
  margin-top: 10px;
}
</style>
