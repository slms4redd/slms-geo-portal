<template>
  <div>
    <div v-for="(legendUrl, index) in legendUrls" :key="`legendUrl-${index}`">
      <img :src="legendUrl"/>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  props: {
    conf: Object
  },
  data() {
    return {
      legendUrls: this.conf.legend(Vue.i18n.locale())
    }
  }
}
</script>
