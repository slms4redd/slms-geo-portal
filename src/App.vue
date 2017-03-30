<template>
  <div id="app">
    <mapPane></mapPane>
    <div class="layers">
      <layerSelector></layerSelector>
      <editor-console v-if="user.authenticated"></editor-console>
    </div>
    <banner></banner>
    <contextInfoModal></contextInfoModal>
    <featureInfo></featureInfo>
    <feedback></feedback>
    <KMLOverlay></KMLOverlay>
<!--     <EditGroup></EditGroup>
    <EditContext></EditContext>
    <EditLayers></EditLayers>
 -->  </div>
</template>

<script>
import Banner from './components/Banner';
import MapPane from './components/MapPane';
import LayerSelector from './components/LayerSelector';
import ContextInfoModal from './components/ContextInfoModal';
import FeatureInfo from './components/FeatureInfo';
import Feedback from './components/Feedback';
import KMLOverlay from './components/KMLOverlay';
// import EditGroup from './components/edit/EditGroup';
// import EditContext from './components/edit/EditContext';
// import EditLayers from './components/edit/EditLayers';
import EditorConsole from './components/edit/EditorConsole';
import auth from './auth';

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
    // EditGroup,
    // EditContext,
    // EditLayers,
    EditorConsole
  },
  data() {
    return {
      user: auth.user
    };
  },
  created() {
    this.$store.dispatch('getAllLayers');
  }
};
</script>

<style lang="scss">
@import "./assets/global.scss";

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
.layers {

  position: absolute;
  top: $banner-height + 8px;
  left: 8px;
}
</style>
