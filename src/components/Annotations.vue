<template>
  <div class="annotations">
    <div  class="annotations-button-panel">
      <div class="annotations-title">{{$t("annotations.title")}}</div>
      <div class="button actions" v-show="!open" @click="clearVector">
        <icon name="trash"/>
      </div>
      <div class="button actions" v-show="!open" @click="toggleLayer">
        <icon v-if="visible" name="eye"/>
        <icon v-else name="eye-slash"/>
      </div>
      <div class="button"  @click="togglePanel">
        <icon v-if="open" name="angle-up"/>
        <icon v-else name="angle-down"/>
      </div>
    </div>
    <div v-if="open" class="annotations-panel">
      <div class="geometry-types-selection">
        <div v-for="(geomType, idx) in geometryTypes"
          :key="geomType"
          class="selector-button"
          :class="{active: curGeomType === geomType, last: idx === geometryTypes.length - 1}"
          @click="curGeomType = geomType">
          {{$t(`annotations.geomTypes.${geomType}`)}}
        </div>
      </div>
      <div class="feature-list">
      </div>
    </div>
    <div id="popup" class="ol-popup">
      <span class="ol-popup-closer" @click="displayPopup(false)"></span>
      <div id="popup-content">
        <input v-model="featureText" placeholder="Add label" type="text"/><button class="f-label" @click="setFeatureStyle">Add</button>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'

import 'vue-awesome/icons/angle-down'
import 'vue-awesome/icons/angle-up'
import 'vue-awesome/icons/eye'
import 'vue-awesome/icons/eye-slash'
import 'vue-awesome/icons/trash'
import 'ol/ol.css'
import { Style, Fill, Stroke, Text } from 'ol/style'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Draw, { createBox, createRegularPolygon } from 'ol/interaction/Draw'
import { GeoJSON } from 'ol/format'
import Overlay from 'ol/Overlay'
import { v4 } from 'uuid'
import map from '../map'

let source
let layer
let interaction
let popup

export default {
  components: {
    Icon
  },
  data: () => {
    const geometryTypes = ['circle', 'triangle', 'rectangle']

    return {
      curGeomType: geometryTypes[0],
      open: false,
      visible: false,
      geometryTypes,
      featureText: '',
      id: '',
      currentFeature: {}
    }
  },
  mounted() {
    source = new VectorSource({
      wrapX: false
    })
    layer = new VectorLayer({
      source,
      map,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255,255,255,0.4)'
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2
        })
      })
    })
    popup = new Overlay({
      element: document.getElementById('popup'),
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    })
    map.on('click', (e) => this.onFeatureClick(e))
  },
  watch: {
    curGeomType(curGeomType) {
      if (this.open) {
        this.createInteraction(curGeomType)
      }
    },
    open(open) {
      if (open) {
        this.createInteraction(this.curGeomType)
      }
    }
  },
  methods: {
    onFeatureClick(e) {
      // Get selected feature to modify label
      const feature = map.forEachFeatureAtPixel(e.pixel,
        (feature) => {
          return feature || {}
        }
      )
      // Get feature coordinates
      const coordinates = feature.getGeometry().getCoordinates()[0]
      if (coordinates.length) {
        // Fetch label if present
        if (feature && feature.getStyle()) this.featureText = feature.getStyle().getText().getText() || ''
        this.currentFeature = feature
        this.id = feature.getProperties().id
        // Display label popup
        map.addOverlay(popup)
        popup.setPosition(coordinates[0])
        this.displayPopup(true)
      }
    },

    displayPopup(show) {
      if (show) document.getElementById('popup').style.display = 'block'
      else document.getElementById('popup').style.display = 'none'
    },

    togglePanel() {
      const open = !this.open
      this.open = open
      if (!open) {
        this.removeInteraction()
      }
    },

    toggleLayer() {
      const visible = !layer.getVisible()
      layer.setVisible(visible)
      map.updateSize()
      this.visible = visible
      this.$store.commit('set_annotations_visible', { visible })
    },

    showLayer() {
      this.visible = true
      layer.setVisible(true)
    },

    clearVector() {
      source.clear()
      this.$store.commit('clear_annotations')
      this.visible = false
    },

    removeInteraction() {
      if (interaction) {
        map.removeInteraction(interaction)
      }
    },

    setFeatureStyle() {
      const currentFeature = this.currentFeature
      const text = this.featureText
      // Feature style
      const featureStyle = new Style({
        fill: new Fill({
          color: 'rgba(255,255,255,0.4)'
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2
        }),
        text: new Text({
          textAlign: 'center',
          textBaseline: 'middle',
          font: 'bold 16px sans-serif',
          text,
          fill: new Fill({
            color: '#fff'
          }),
          placement: 'point',
          overflow: true
        })
      })
      currentFeature.setStyle(featureStyle)
      currentFeature.setProperties({ id: this.id })
      // Update current selected feature with style and custom property
      const geoJSON = JSON.parse(new GeoJSON().writeFeatures([currentFeature]))
      this.$store.commit('set_annotations_geojson', { layer: geoJSON, label: text })
      this.featureText = ''
      this.displayPopup(false)
    },

    createInteraction(geomType) {
      if (interaction) {
        map.removeInteraction(interaction)
      }

      let options
      switch (geomType) {
        case 'circle':
          options = {
            type: 'Circle',
            geometryFunction: createRegularPolygon(0)
          }
          break
        case 'triangle':
          options = {
            type: 'Circle',
            geometryFunction: createRegularPolygon(3)
          }
          break
        case 'rectangle':
          options = {
            type: 'Circle',
            geometryFunction: createBox()
          }
          break
        default:
          options = null
      }

      if (options) {
        interaction = new Draw({
          source,
          ...options
        })
        map.addInteraction(interaction)
        interaction.on('drawend', e => {
          // Unique id for feature
          const id = v4()
          e.feature.setProperties({ id })
          this.currentFeature = e.feature

          // Convert to GEOJSON
          const geoJson = new GeoJSON()
          const features = geoJson.writeFeatures([e.feature])
          this.id = id
          this.$store.commit('set_annotations_geojson', { layer: JSON.parse(features) })
          this.$store.commit('set_annotations_visible', { visible: true })
          this.showLayer()

          // Clear text on load popup
          this.featureText = ''
          // Get first coordinate position to display popup
          const [coordinate] = geoJson.readFeatures(features)[0].getGeometry().getCoordinates()[0]
          map.addOverlay(popup)
          popup.setPosition(coordinate)
          this.displayPopup(true)
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/global.scss";

.annotations {
  margin-left: 10px;
  background: $transparent-panel-background;
  border-radius: 5px;
  backdrop-filter: blur(5px);
}
.annotations-button-panel {
  display: flex;
  flex-direction: row;
  font-size: 14px;
  font-weight: bold;
  color: white;
  min-height: 45px;
}
.annotations-title {
  flex-grow: 1;
  justify-content: center;
  padding: 0 10px;
  line-height: 45px;
  text-align: center;
}
.annotations-button-panel > .button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 10px;
  border-left: 1px solid white;
  background-color: transparent;
  font-size: 30px;
  min-height: 0;
}
.actions {
  border-left: none !important;
}
.annotations-button-panel > .button:hover {
  color: $highlight-color;
  cursor: pointer;
}
.annotations-panel {
  padding: 10px;
}
.geometry-types-selection {
  display: flex;
  color: white;
  padding: 0 6px 0 6px;
}
.selector-button {
  border: 1px solid transparent;
  margin-right: 16px;
  padding: 8px;
  border-radius: 8px;
  font-size: 14px;
}
.selector-button:hover {
  border-color: $highlight-color;
  cursor: pointer;
}
.selector-button.active {
  border-color: white
}
.selector-button.last {
  margin: 0;
}
.ol-popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  min-width: 280px;
}
.ol-popup:after, .ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}
.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}
.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
  color: #6e7173
}
.ol-popup-closer:after {
  content: "✖";
}
.f-label {
  padding: 4px 12px;
  margin-left: 4px;
}
#popup-content input {
  font-size: 16px;
}
</style>
