<template>
  <modal v-if="showModal" @close="$store.dispatch('hideLayerInfo')">
    <h1 slot="header">{{label}}</h1>
    <div slot="body" v-html="content"></div>
  </modal>
</template>

<script>
import Modal from './Modal'
import { mapState } from 'vuex'
import httpRequest from '../httpRequest'
import { config } from 'vue';

export default {
  data() {
    return {
      showModal: false
    }
  },
  components: {
    'modal': Modal
  },
  watch: {
    layerInfo: function(val) {
      if (!val.fileName) {
        this.showModal = false;
      } else {
        this.label = val.label;

        const showContent = content => {
          this.content = content;
          this.showModal = true;
        }
        httpRequest(`/static/loc/${config.lang}/html/${val.fileName}`, (responseText) => {
          showContent(responseText);
        }, (error) => {
          showContent('Cannot get layer info');
        });
      }
    }
  },
  computed: mapState([
    'layerInfo'
  ])
}
</script>

<style scoped>
h1 {
  font-size: 16px;
}
</style>
