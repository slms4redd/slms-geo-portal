<template>
  <div id="app">
    <!--legendPane></legendPane-->
    <mapPane></mapPane>
    <banner></banner>
    <layerSelector></layerSelector>
  </div>
</template>

<script>
import Banner from './components/Banner'
// import LegendPane from './components/LegendPane'
import MapPane from './components/MapPane'
import LayerSelector from './components/LayerSelector'

export default {
  name: 'app',
  components: {
    Banner,
    // LegendPane,
    MapPane,
    LayerSelector
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
}
html {
  height: 100%;
}
body {
  /* min-height: 100%; */
  height: 100%;
  overflow: hidden;
}
</style>
