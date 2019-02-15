<template>
  <div v-if="kmlOverlay" id="outer">
    <div id="message">
      <!-- <div><b>Message:</b> {{kmlOverlay.message}}</div> -->
      <button @click="clearFeedback" class="small" id="clearButton">{{$t("kmlOverlay.clear")}}</button>
    </div>
  </div>
</template>

<script>
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Circle from 'ol/style/Circle'
import KML from 'ol/format/KML'
import { mapState } from 'vuex'
import map from '../map'

let vectorLayer

export default {
  methods: {
    clearFeedback() { this.$store.commit('overlay_kml', { kml: null }) }
  },
  watch: {
    kmlOverlay(kml) {
      map.removeLayer(vectorLayer)
      if (kml) {
        const vectorSource = new VectorSource({
          features: (new KML({ extractStyles: false })).readFeatures(kml, { featureProjection: 'EPSG:3857' })
        })

        const stroke = new Stroke({
          color: '#319FD3',
          width: 1
        })
        const fill = new Fill({
          color: 'rgba(255, 255, 255, 0.3)'
        })
        const circle = new Circle({
          fill: fill,
          stroke: stroke,
          radius: 5
        })

        const defaultStyle = {
          'Point': new Style({
            image: circle
          }),
          'LineString': new Style({
            stroke: stroke
          }),
          'Polygon': new Style({
            fill: fill,
            stroke: stroke
          }),
          'MultiPoint': new Style({
            image: circle
          }),
          'MultiLineString': new Style({
            stroke: stroke
          }),
          'MultiPolygon': new Style({
            fill: fill,
            stroke: stroke
          })
        }

        const styleFunction = function(feature, resolution) {
          const featureStyleFunction = feature.getStyleFunction()
          if (featureStyleFunction) {
            return featureStyleFunction.call(feature, resolution)
          }
          return defaultStyle[feature.getGeometry().getType()]
        }

        vectorLayer = new VectorLayer({
          source: vectorSource,
          style: styleFunction
        })

        // Make sure it stays on top
        vectorLayer.setZIndex(1000)
        map.addLayer(vectorLayer)
        map.getView().fit(vectorSource.getExtent(), map.getSize())
      }
    }
  },
  computed: mapState([
    'kmlOverlay'
  ])
}
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
