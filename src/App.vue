<template>
  <div id="app">
    <mapPane></mapPane>
    <banner></banner>
    <layerSelector></layerSelector>
    <contextInfoModal></contextInfoModal>
    <mapInfo></mapInfo>
    <!--<timeChooser></timeChooser>-->
  </div>
</template>

<script>
import Banner from './components/Banner'
import MapPane from './components/MapPane'
import LayerSelector from './components/LayerSelector'
import ContextInfoModal from './components/ContextInfoModal'
import MapInfo from './components/MapInfo'
// import TimeChooser from './components/TimeChooser'

export default {
  name: 'app',
  components: {
    Banner,
    MapPane,
    LayerSelector,
    ContextInfoModal,
    MapInfo
    // TimeChooser
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
