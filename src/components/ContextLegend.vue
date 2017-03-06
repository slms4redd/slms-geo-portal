<template>
  <div>
    <div v-for="legendUrl in legendUrls">
      <img v-bind:src="legendUrl"></img>
    </div>
  </div>
</template>

<script>
import { config } from 'vue'

export default {
  props: {
    conf: Object,
  },
  data() {
    return {
      legendUrls: this.conf.layers.map(layer => {
        if (layer.legend) {
          if (layer.legend.type === 'wms') {
            const wmsLegendStyle = layer.legend.style.replace('$(_lang)', config.lang);
            return `${layer.urls[0]}?LEGEND_OPTIONS=forceRule:True;fontColor:ffffff;fontAntiAliasing:true;
  &LAYER=${layer.name}&STYLE=${wmsLegendStyle}&REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=18&HEIGHT=18&TRANSPARENT=true`;
          }
          return `/static/configuration/loc/${config.lang}/images/${layer.legend.url}`
        }
        return null;
      }).filter(url => url)
    }
  }
}
</script>

<style scoped>
</style>
