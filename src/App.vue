<template>
  <div id="app">
    <mapPane></mapPane>
      <div id="left-container">
        <div class="layers">
          <layerSelector></layerSelector>
          <editor-console v-if="showConsole"></editor-console>
        </div>
        <annotations v-show="this.$parent.loaded"></annotations>
    </div>
    <!-- Hide until language is first loaded, to avoid showing i18n placeholders -->
    <!-- Using v-show instead of v-if to optimize image loading -->
    <banner v-show="this.$parent.loaded"></banner>

    <contextInfoModal></contextInfoModal>
    <featureInfo></featureInfo>
    <feedback></feedback>
    <KMLOverlay></KMLOverlay>
    <Logos v-if="llLogos" id="ll_logos" :logosList="llLogos"></Logos>
    <measure></measure>

    <v-dialog />

    <search></search>
  </div>
</template>

<script>
import Vue from 'vue'

import Banner from './components/Banner'
import MapPane from './components/MapPane'
import LayerSelector from './components/LayerSelector'
import ContextInfoModal from './components/ContextInfoModal'
import FeatureInfo from './components/FeatureInfo'
import Feedback from './components/Feedback'
import KMLOverlay from './components/KMLOverlay'
import Logos from './components/Logos'
import Measure from './components/Measure'
import Search from './components/Search'
import Annotations from './components/Annotations'
import { logos, welcomePage } from 'config'

import auth from './auth'

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
    Measure,
    Logos,
    Search,
    Annotations
    // EditorConsole
  },
  data() {
    return {
      user: auth.user,
      showConsole: false,
      llLogos: logos && logos.ll || null,
      resizable: true,
      adaptive: true,
      draggable: true
    }
  },
  created() {
    this.$store.dispatch('fetchLayersConfig')
    if (this.user.authenticated) this.loadEditor()
  },
  watch: {
    'user.authenticated'() {
      if (this.user.authenticated) this.loadEditor()
      else this.showConsole = false
    }
  },
  mounted() {
    if (welcomePage) {
      this.showWelcomePage(true, true, true)
    }
  },
  methods: {
    loadEditor() {
      require.ensure(['./components/edit/EditorConsole'], require => {
        Vue.component('EditorConsole', require('./components/edit/EditorConsole'))
        this.showConsole = true
      }, 'editing-chunk')
    },

    showWelcomePage(resizable, adaptive, draggable) {
      this.resizable = resizable
      this.adaptive = adaptive
      this.draggable = draggable
      /*
        $nextTick is required because the data model with new
        "resizable, adaptive, draggable" values is not updated yet.. eh
      */
      this.$nextTick(() => {
        this.$modal.show({
          template: `
            <div class="iframe-modal-content">
              <div>Welcome</div>
              <iframe v-bind:src="iframesrc" width=100% height=100%><b>Welcome to Gonini.org!</b></iframe>
            </div>
          `,
          props: ['iframesrc']
        }, {
          iframesrc: welcomePage
        }, {
          transition: 'nice-modal-fade',
          draggable: draggable,
          adaptive: adaptive,
          resizable: resizable,
          width: 710,
          height: 850
        })
      })
    }
  }
}
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
#left-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  position: absolute;
  left: 8px;
  bottom: 65px;
  top: $banner-height + 8px;
}
.layers {
  overflow: hidden;
  pointer-events: none;
  align-self: stretch;
}
#ll_logos {
  position: absolute;
  bottom: 10px;
  left: 0px;
}
.iframe-modal-content{
  height: 100%;
}
</style>
