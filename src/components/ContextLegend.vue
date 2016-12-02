<template>
  <div>
    <div v-for="layer in model.layers">
      <!--img v-bind:src="'/static/loc/' + lang + '/images/' + layer.legend"></img-->
      <img v-if="layer.legendStyle" v-bind:src="'/static/loc/' + lang + '/images/' + layer.legend"></img>
      <img v-else-if="layer.legend" v-bind:src="'/static/loc/' + lang + '/images/' + layer.legend"></img> <!-- TODO -->
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
      lang: config.lang
    }
  },
  methods: {
    toggle() {
      this.show = !this.show;
    },
  }
}
</script>

<style scoped>
</style>
