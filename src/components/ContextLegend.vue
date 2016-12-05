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
    model: Object,
  },
  data() {
    return {
      legendUrls: this.model.layers.map(layer => {
        if (layer.wmsLegendStyle) {
          const wmsLegendStyle = layer.wmsLegendStyle.replace('$(_lang)', config.lang);
          return `${layer.baseUrl}?LEGEND_OPTIONS=forceRule:True;fontColor:ffffff&LAYER=${layer.wmsName}&STYLE=${wmsLegendStyle}`
                 + '&REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&TRANSPARENT=true';
        } else {
          return `/static/loc/${config.lang}/images/${layer.legend}`
        }
      })
    }
  },
  methods: {
    toggle() {
      this.show = !this.show;
    }
  }
}
</script>

<style scoped>
</style>
