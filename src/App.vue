<template>
  <div id="app">
    <mapPane></mapPane>
    <layerSelector></layerSelector>
    <banner></banner>
    <contextInfoModal></contextInfoModal>
    <featureInfo></featureInfo>
    <feedback></feedback>
    <KMLOverlay></KMLOverlay>
    <EditGroup></EditGroup>
    <EditContext></EditContext>
    <EditLayers></EditLayers>
  </div>
</template>

<script>
import Banner from './components/Banner';
import MapPane from './components/MapPane';
import LayerSelector from './components/LayerSelector';
import ContextInfoModal from './components/ContextInfoModal';
import FeatureInfo from './components/FeatureInfo';
import Feedback from './components/Feedback';
import KMLOverlay from './components/KMLOverlay';
import EditGroup from './components/edit/EditGroup';
import EditContext from './components/edit/EditContext';
import EditLayers from './components/edit/EditLayers';

export default {
  name: 'app',
  components: {
    Banner,
    MapPane,
    LayerSelector,
    ContextInfoModal,
    FeatureInfo,
    Feedback,
    KMLOverlay,
    EditGroup,
    EditContext,
    EditLayers
  },
  created() {
    this.$store.dispatch('getAllLayers');
  }
};
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
  background: url(assets/page-background.jpg) repeat 0 0;
}
</style>
