<template>
  <modal v-if="showModal" @close="$store.dispatch('hideLayerInfo')">
    <h1 slot="header">{{label}}</h1>
    <div slot="body" v-html="content"></div>
  </modal>
</template>

<script>
import Modal from './Modal'
import { mapGetters } from 'vuex'

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
        const xmlhttp = new XMLHttpRequest(),
              url = `/static/${val.fileName}`,
              that = this;
        
        this.label = val.label;
        xmlhttp.onreadystatechange = function() {
          if (this.readyState === 4) {
            if (this.status === 200) {
              that.content = this.responseText;
            } else {
              that.content = 'Error retrieving info';
            }
            that.showModal = true;
          }
        };
        
        xmlhttp.open("GET", url, true);
        xmlhttp.send()
      }
    }
  },
  computed: mapGetters([
    'layerInfo'
  ])
}
</script>

<style scoped>
h1 {
  font-size: 16px;  
}
</style>
