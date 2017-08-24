<template>
  <div>
    <div v-for="legendUrl in legendUrls">
      <img v-bind:src="legendUrl"></img>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  props: {
    conf: Object
  },
  data() {
    return {
      legendUrls: this.conf.layers.map(layer => {
        if (layer.legend) {
          if (layer.legend.type === 'wms') {
            const wmsLegendStyle = layer.legend.style.replace('$(_lang)', Vue.i18n.locale())
            return `${layer.urls[0]}?LEGEND_OPTIONS=forceRule:True;fontColor:ffffff;fontAntiAliasing:true
  &LAYER=${layer.name}&STYLE=${wmsLegendStyle}&REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=18&HEIGHT=18&TRANSPARENT=true`
          }
          return `/static/configuration/loc/${Vue.i18n.locale()}/images/${layer.legend.url}`
        }
        return null
      }).filter(url => url)
    }
  }
}
</script>
