<template>
  <div v-if="isMobile" id="mobile-tools-bar" class="transparent-panel">
    <div class="mobile-tool-bar-button" @click="toggleLocation">
      <icon :class="{'icon-active': locationActive}" name="map-marker"/>
      <div v-if="gettingLocation" id="map-marker-loader" class="loader"/>
    </div>
    <div class="mobile-tool-bar-button" @click="toggleTool('layerSelector')">
      <icon :class="activeClass('layerSelector')" name="slms-layers"/>
    </div>
    <div class="mobile-tool-bar-button" @click="toggleTool('measure')">
      <icon :class="activeClass('measure')" name="slms-ruler"/>
    </div>
    <div class="mobile-tool-bar-button" @click="toggleTool('annotations')">
      <icon :class="activeClass('annotations')" name="sticky-note"/>
    </div>
    <div class="mobile-tool-bar-button" @click="toggleTool('feedback')">
      <icon :class="activeClass('feedback')" name="slms-feedback"/>
    </div>
    <div class="mobile-tool-bar-button" @click="toggleTool('kmlUpload')">
      <icon :class="activeClass('kmlUpload')" name="slms-kml"/>
    </div>
    <div v-if="enablePrint" class="mobile-tool-bar-button" @click="printMap">
      <icon name="slms-pdf"/>
      <div v-if="printingInProgress" id="print-map-loader" class="loader"/>
    </div>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import { mapGetters, mapState } from 'vuex'
import Geolocation from 'ol/Geolocation'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'

import 'vue-awesome/icons/sticky-note'
import 'vue-awesome/icons/map-marker'

import tools from '../tools'
import map from '../map'

let geolocation
let locationLayer
let accuracyFeature
let positionFeature
let positionChanged = false

export default {
  components: {
    Icon
  },
  data() {
    return {
      locationActive: false,
      gettingLocation: false
    }
  },
  mounted() {
    geolocation = new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true
      },
      projection: map.getView().getProjection()
    })
    geolocation.on('error', (e) => {
      this.gettingLocation = false
      alert(e.message)
    })

    accuracyFeature = new Feature()
    geolocation.on('change:accuracyGeometry', () => accuracyFeature.setGeometry(geolocation.getAccuracyGeometry()))

    positionFeature = new Feature()
    positionFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: '#3399CC'
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2
          })
        })
      })
    )
    geolocation.on('change:position', () => {
      const coordinates = geolocation.getPosition()
      positionFeature.setGeometry(coordinates ? new Point(coordinates) : null)

      if (!positionChanged) {
        map.getView().setCenter(coordinates)
        positionChanged = true
      }
      if (this.gettingLocation) {
        this.gettingLocation = false
      }
    })

    locationLayer = new VectorLayer({
      map,
      source: new VectorSource({
        features: [accuracyFeature, positionFeature]
      })
    })

    locationLayer.setVisible(false)
  },
  methods: {
    printMap() {
      tools.printMap(this.$store, this.activeLayers, this.activeContexts, this.annotationLayer)
    },
    toggleTool(tool) {
      this.$store.commit('set_active_tool', { tool: tool === this.activeTool ? null : tool })
    },
    toggleLocation() {
      this.locationActive = !this.locationActive
    },
    activeClass(tool) {
      return {
        'icon-active': tool === this.activeTool
      }
    }
  },
  watch: {
    locationActive(locationActive) {
      if (locationActive) {
        positionChanged = false
        this.gettingLocation = true
      } else {
        accuracyFeature.setGeometry()
        positionFeature.setGeometry()
      }
      locationLayer.setVisible(locationActive)
      geolocation.setTracking(locationActive)
    }
  },
  computed: {
    tools: () => tools,
    ...mapGetters([
      'activeLayers',
      'activeContexts',
      'annotationLayer'
    ]),
    ...mapState({
      isMobile: state => state.appMode === 'mobile',
      enablePrint: state => state.enablePrint,
      activeTool: state => state.activeTool,
      printingInProgress: state => state.printingInProgress
    })
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/global.scss";

#mobile-tools-bar {
  position: absolute;
  display: flex;
  flex-direction: column;
  top: $banner-height + 16px;
  color: white;
}
#mobile-tools-bar .loader {
  position: absolute;
  width: 6px;
  height: 6px;
  border-width: 2px;
  border-top-width: 2px;
}
#map-marker-loader {
  right: 6px;
  bottom: 0;
}
#print-map-loader {
  right: 0;
  bottom: 0;
}
.mobile-tool-bar-button {
  position: relative;
  margin: 4px;
}
.mobile-tool-bar-button > svg {
  width: 36px;
  height: 36px;
}

</style>
