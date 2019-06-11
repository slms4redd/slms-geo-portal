<template>
  <modal name="context-info-modal" :draggable=true :resizable=true :minWidth=250 :minHeight=220>
    <div class="context-info-modal">
      <button class="btn" @click="closeByName">X</button>
      <div class="content" v-html="content" />
    </div>
  </modal>
</template>

<script>
import { mapState } from 'vuex'
import httpRequest from '../httpRequest'
import Vue from 'vue'

const processUrlTemplate = function(urlTemplate) {
  return urlTemplate.replace('$(_lang)', Vue.i18n.locale())
}

export default {
  data() {
    return {
      showModal: false,
      custom_content: null,
      content: null
    }
  },
  methods: {
    closeByName() {
      this.$modal.hide('context-info-modal')
    }
  },
  watch: {
    layerInfo: function(val) {
      if (!val.fileName && !val.custom_content) {
        this.showModal = false
      } else {
        this.label = val.label

        const showContent = content => {
          this.content = content
          this.showModal = true
          this.$modal.show('context-info-modal')
        }

        if (!val.custom_content) {
          httpRequest('GET', processUrlTemplate(val.fileName))
            .then(responseText => showContent(responseText))
            .catch(error => showContent(`Cannot get layer info:\n${error.statusText}`))
        } else {
          showContent(val.custom_content)
        }
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
.context-info-modal .btn {
  float: right
}
</style>
