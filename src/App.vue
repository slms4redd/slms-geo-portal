<template>
  <div id="app">
    <!--legendPane></legendPane-->
    <mapPane></mapPane>
    <banner></banner>
    <layerSelector></layerSelector>
    <mapInfo></mapInfo>
    <contextInfoModal></contextInfoModal>
  </div>
</template>

<script>
import Banner from './components/Banner'
import MapPane from './components/MapPane'
import LayerSelector from './components/LayerSelector'
import MapInfo from './components/MapInfo'
import ContextInfoModal from './components/ContextInfoModal'
// import LegendPane from './components/LegendPane'

export default {
  name: 'app',
  components: {
    Banner,
    MapPane,
    LayerSelector,
    MapInfo,
    ContextInfoModal
    // LegendPane
  },
  created () {
    this.$store.dispatch('getAllLayers');
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
