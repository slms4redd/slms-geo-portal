<template>
  <div>
    <div v-for="layer in model.layers">
      <img v-bind:src="'/static/loc/en/images/' + layer.legend"></img> <!-- TODO: language -->
    </div>
  </div>
</template>

<script>
export default {
  props: {
    model: Object
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
