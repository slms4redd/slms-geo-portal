<template>
  <div id="map"></div>
</template>

<script>
import OlLayerFactory from '../olLayerFactory'
import Vue from 'vue'
import { mapGetters, mapState } from 'vuex'

import map from '../map'
import OLProperty from 'ol/layer/Property'
import OLGoogleMaps from 'olgm/OLGoogleMaps'

const olLayers = {}

export default {
  name: 'mapPane',
  data: () => ({
    gmap: null
  }),
  mounted() {
    map.setTarget('map')
    this.gmap = new OLGoogleMaps({
      map
    })
    this.gmap.activate()
  },
  watch: {
    layers(layers) {
      // Remove all layers if any, needed when sorting layers through the admin UI
      map.getLayers().clear()

      layers.forEach(layerConfig => {
        try {
          const olLayer = OlLayerFactory.createOlLayer(layerConfig, Vue.i18n.locale())
          if (olLayer) {
            olLayers[layerConfig.id] = olLayer
            map.addLayer(olLayer)
          }
        } catch (e) {
          console.log(e)
        }
      })
    },

    locale(locale, prev) {
      // Don't refresh layers if the page has just been loaded
      if (prev !== null) {
        this.layers.forEach(layer => {
          if (layer.type !== 'wms') return
          const oldStyle = layer.styles.find(s => s.language === prev).label // TODO rename language to locale
          const newStyle = layer.styles.find(s => s.language === locale).label

          if (oldStyle !== newStyle) olLayers[layer.id].getSource().updateParams({ 'STYLES': newStyle })
        })
      }
    },

    activeLayers(activeLayers) {
      const setVisibleFunc = (l) => {
        const visible = l.visible && activeLayers.some(a => a.id === l.id)
        olLayers[l.id].setVisible(visible)
      }

      // there are problems with layer order if a layer is disabled and then enabled again
      // the reenabled layer will appear on top even if it was at the bottom
      // as a workaround we disable google layers before changing visibility
      const googleLayers = this.layers.filter(l => l.type === 'google')
      googleLayers.forEach(l => olLayers[l.id].setVisible(false))

      this.layers.filter(l => l.type !== 'google').forEach(setVisibleFunc)

      // reenable google layers after all other layers have been processed
      googleLayers.forEach(setVisibleFunc)
    },

    contextsTimes(contextsTimes) {
      for (const contextId in contextsTimes) {
        if (contextsTimes[contextId]) {
          const context = this.contexts.find(c => c.id === +contextId)
          context.layers.forEach(l =>
            olLayers[l.id].getSource().updateParams({ 'TIME': contextsTimes[contextId].iso8601 }))
        }
      }
    },

    // If anyone of the OLProperties are found in context, apply to the layers
    contexts(contexts) {
      this.contexts.forEach(context => {
        Object.values(OLProperty)
        .filter(p => context.hasOwnProperty(p))
        .forEach(p => {
          context.layers.filter(l => l.type !== 'google')
                    .forEach(l => olLayers[l.id].set(p, context[p]))
        })
      })
    }
  },

  computed: {
    ...mapState({
      'layers': state => state.layers,
      'contexts': state => state.contexts,
      'contextsTimes': state => state.contextsTimes,
      'locale': state => state.i18n.locale
    }),
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
  bottom: 20px;
  right: 20px;
  font-size: 13px;
  font-weight: bold;
}
</style>
