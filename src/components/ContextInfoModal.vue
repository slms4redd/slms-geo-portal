<template>
  <modal name="context-info-modal" :draggable=true :resizable=true :minWidth=250 :minHeight=220 @closed="resetState">
    <div class="context-info-modal">
      <button class="btn" @click="closeByName">X</button>
      <div class="content" v-html="content" />
      <div v-if="showDownloadLinks" class="context-info-modal-download-links">
        <div><b>{{layerInfo.label}}</b></div>
        <br>
        <button @click="requestEmailChange">{{$t('contextInfoModal.changeEmailLabel')}}</button>
        <br>
        <table>
          <tbody>
            <tr v-for="downLink in downloadLinksIntl" :key="downLink.url">
              <td><a :href="downLink.url" target="_blank" rel="noopener noreferrer" @click="processDownloadLink(downLink)">{{downLink.label}}</a></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="showEmailPrompt" class="context-info-modal-email-content">
        <h3>{{$t("contextInfoModal.emailTitle")}}</h3>
        <input type="text" :value="email" :class="{invalid: emailInvalid}" @change="changeEmail"/>
        <button @click="validateEmailAndContinue">{{$t("contextInfoModal.submitDataLabel")}}</button>
      </div>
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

const isValidEmail = (str) => {
  const regexp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  return regexp.test(str)
}

export default {
  data() {
    return {
      showModal: false,
      custom_content: null,
      content: null,
      needsEmail: false,
      email: '',
      emailInvalid: false,
      showDownloadLinks: false
    }
  },
  methods: {
    closeByName() {
      this.$modal.hide('context-info-modal')
    },
    changeEmail(e) {
      this.email = e.target.value
    },
    resetState() {
      this.email = ''
      this.emailInvalid = false
      this.content = ''
      this.showDownloadLinks = false
    },
    showLayerInfoContent(val) {
      this.label = val.label

      const showContent = content => {
        this.content = content
        this.$modal.show('context-info-modal')
      }

      httpRequest('GET', processUrlTemplate(val.fileName))
        .then(responseText => showContent(responseText))
        .catch(error => showContent(`Cannot get layer info:\n${error.statusText}`))
    },
    validateEmailAndContinue() {
      if (!isValidEmail(this.email)) {
        this.emailInvalid = true
      } else {
        const localStorage = window.localStorage
        localStorage.setItem('userEmail', this.email)

        this.emailInvalid = false
        this.needsEmail = false
        this.showDownloadLinks = true
      }
    },
    requestEmailChange() {
      this.needsEmail = true
      this.showDownloadLinks = false
    },
    processDownloadLink({ url }) {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/layer_info_download_log')
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.send(JSON.stringify({ email: this.email, link: url }))
    }
  },
  watch: {
    layerInfo: function(val) {
      if (!val.showDownload) {
        this.showLayerInfoContent(val)
      } else {
        const localStorage = window.localStorage
        const userEmail = localStorage.getItem('userEmail')

        if (!userEmail) {
          this.needsEmail = true
          this.$modal.show('context-info-modal')
        } else {
          this.email = userEmail
          this.needsEmail = false
          this.showDownloadLinks = true
          this.$modal.show('context-info-modal')
        }
      }
    }
  },
  computed: {
    ...mapState([
      'layerInfo'
    ]),
    showEmailPrompt() {
      return !!this.layerInfo && this.layerInfo.showDownload && this.needsEmail && !this.showDownloadLinks
    },
    downloadLinksIntl() {
      return (this.layerInfo.downloadLinks || []).map(d => ({ ...d, label: d.labels.find(l => l.language === Vue.i18n.locale()).label }))
    }
  }
}
</script>

<style scoped>
h1 {
  font-size: 16px;
}
.context-info-modal .btn {
  float: right
}
.context-info-modal-email-content {
  padding: 15px;
}
.context-info-modal-email-content > button {
  margin-left: 5px;
}
.context-info-modal-email-content > input {
  border: 1px solid gray;
  border-radius: 5px;
  padding: 6px;
}
.context-info-modal-email-content > input.invalid {
  border: 2px solid red;
}
.context-info-modal-download-links {
  padding: 20px;
}
.context-info-modal-download-links > button {
  display: block;
}
</style>
