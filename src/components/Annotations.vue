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
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import map from '../map'
import 'vue-awesome/icons/angle-down'
import 'vue-awesome/icons/angle-up'
import 'vue-awesome/icons/eye'
import 'vue-awesome/icons/eye-slash'
import 'vue-awesome/icons/trash'
import { Style, Fill, Stroke } from 'ol/style'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Draw, { createBox, createRegularPolygon } from 'ol/interaction/Draw'
import { GeoJSON } from 'ol/format'

let source
let layer
let interaction

export default {
  components: {
    Icon
  },
  props: {
    map: Object
  },
  data: () => {
    const geometryTypes = ['circle', 'triangle', 'rectangle']

    return {
      curGeomType: geometryTypes[0],
      open: false,
      visible: false,
      geometryTypes
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
          color: 'transparent'
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2
        })
      })
    })
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
          // Pass the feature as an array to generate geoJSON object
          const geoJSON = JSON.parse(new GeoJSON().writeFeatures([e.feature]))
          this.$store.commit('set_annotations_geojson', { layer: geoJSON })
          this.$store.commit('set_annotations_visible', { visible: true })
          this.showLayer()
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
</style>
