<template>
  <div>
    <div v-for="legendUrl in legendUrls">
      <img :src="legendUrl"></img>
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
