<template>
  <div id="map"></div>
</template>

<script>
import OlLayerFactory from '../olLayerFactory'
import { mapGetters, mapState } from 'vuex'
import map from '../map'

const olLayers = {}

export default {
  name: 'mapPane',
  mounted() {
    map.setTarget('map')
  },
  watch: {
    layers(layers) {
      // Remove all layers if any, needed when sorting layers through the UI
      map.getLayers().forEach(l => map.removeLayer(l))

      layers.forEach(layerConfig => {
        try {
          const olLayer = OlLayerFactory.createOlLayer(layerConfig)
          if (olLayer) {
            olLayers[layerConfig.id] = olLayer
            map.addLayer(olLayer)
          }
        } catch (e) {
          console.log(e)
        }
      })
    },
    activeLayers(activeLayers) {
      this.layers.forEach(l =>
        olLayers[l.id].setVisible(l.visible && activeLayers.find(a => a.id === l.id)))
    },
    contextsTimes(contextsTimes) {
      for (const contextId in contextsTimes) {
        if (contextsTimes[contextId]) {
          const context = this.contexts.find(c => c.id === +contextId)
          context.layers.forEach(l =>
            olLayers[l.id].getSource().updateParams({ 'TIME': contextsTimes[contextId].iso8601 }))
        }
      }
    }
  },

  computed: {
    ...mapState([
      'layers',
      'contexts',
      'contextsTimes'
    ]),
    ...mapGetters([
      'activeLayers'
    ])
  }
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
  left: auto;
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
.ol-mouse-position {
  position: absolute;
  color: #f3f3f3;
  -webkit-font-smoothing: antialiased;
  text-shadow: #000 0px 0px 2px, #000 0px 0px 2px, #000 0px 0px 2px;
  top: auto;
  bottom: 26px;
  font-size: 13px;
  font-weight: bold;
}
</style>
