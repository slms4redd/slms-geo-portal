<template>
  <div id="header" :class="{ danger: user.authenticated }">
    <div id="title">
      <h1 :class="{ hasSubtitle: $te('banner.subtitle') }">{{$t("banner.title")}}</h1>
      <h2 v-if="$te('banner.subtitle')">{{$t("banner.subtitle")}}</h2>
    </div>
    <ul v-if="languages.length > 1" id="languageLinks" class="buttons">
      <li v-for="language in languages" :key="language.id">
        <span v-if="language.id === selectedLanguage" :href="'?lang=' + language.id">{{language.label}}</span>
         <a v-else href="#" @click="setLanguage(language.id)">{{language.label}}</a>
      </li>
    </ul>
    <ul id="tools" class="buttons">
      <li v-if="!user.authenticated">
        <a href="#" @click="showLoginDialog(true)">Admin</a>
      </li>
      <li v-else>
        <a id="logout-button" href="#" @click="logout">Logout</a>
      </li>
      <li>
        <a href="#" @click.stop="enableFeedback">{{$t("banner.feedback")}}</a>
      </li>
      <li>
        <a href="#" @click="enableUpload">{{$t("banner.uploadKml")}}</a>
      </li>
      <li>
        <a href="#" @click.stop="toggleMeasure">{{$t("banner.measure")}}</a>
      </li>
      <li v-if="printURL">
        <a href="#" @click.stop="printMap">PDF</a>
      </li>
    </ul>
    <file-drop :show=showUpload @disable="disableUpload"></file-drop>
    <login-modal :show=showLogin @disable="showLoginDialog(false)"></login-modal>
  </div>
</template>

<script>
import { languages, printApi } from 'config'
import Vue from 'vue'
import FileDrop from './FileDrop'
import LoginModal from './LoginModal'
import auth from '../auth'
import { getPrintRequest } from '../layersConfig'

import { mapGetters } from 'vuex'

export default {
  components: {
    FileDrop,
    LoginModal
  },
  data() {
    return {
      languages: languages,
      selectedLanguage: Vue.i18n.locale(),
      showUpload: false,
      showLogin: false,
      user: auth.user,
      printURL: printApi && printApi.url || null
    }
  },
  methods: {
    setLanguage(lang) {
      Vue.i18n.load(lang, `static/configuration/locale/${lang}.json`).then((a) => {
        Vue.i18n.set(lang)
        this.selectedLanguage = Vue.i18n.locale()
      }).catch(e => alert('Error loading language file: ' + e))
    },
    enableFeedback(e) {
      e.preventDefault()
      this.$store.commit('enable_feedback', { enable: true })
    },
    enableUpload(e) {
      e.preventDefault()
      this.showUpload = true
    },
    disableUpload() {
      this.showUpload = false
    },
    logout() {
      auth.logout()
    },
    showLoginDialog(show) {
      this.showLogin = show
    },
    toggleMeasure(e) {
      e.preventDefault()
      this.$store.commit('toggle_measure', { enable: true })
    },
    printMap(e) {
      // see https://nehalist.io/downloading-files-from-post-requests/
      e.preventDefault()

      const printRequest = getPrintRequest(this.activeLayers, this.activeContexts, Vue.i18n.locale(), this.annotationLayers)

      const geoserverUrl = printApi.url
      const request = new XMLHttpRequest()
      request.open('POST', geoserverUrl, true)
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      request.responseType = 'blob'

      request.onload = function() {
        // Only handle status code 200
        if (request.status === 200) {
          // Try to find out the filename from the content disposition `filename` value
          const disposition = request.getResponseHeader('content-disposition')
          const matches = /"([^"]*)"/.exec(disposition)
          const filename = (matches != null && matches[1] ? matches[1] : 'map.pdf')

          // The actual download
          const blob = new Blob([request.response], { type: 'application/pdf' })
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          link.download = filename

          document.body.appendChild(link)

          link.click()

          document.body.removeChild(link)
        }
        // TODO error handling
      }
      request.send(`spec=${encodeURIComponent(JSON.stringify(printRequest))}`)
    }
  },
  computed: mapGetters([
    'activeLayers',
    'activeContexts',
    'annotationLayers'
  ])
}
</script>

<style lang="scss" scoped>
@import "../assets/global.scss";

#header.danger {
  background: url('/static/configuration/logos.png') no-repeat 10px 10px,
  repeating-linear-gradient(
    135deg,
    rgba(255, 230, 0, 0.6),
    rgba(255, 230, 0, 0.6) 30px,
    rgba(0, 0, 0, 0.7) 30px,
    rgba(0, 0, 0, 0.7) 60px
  );
  backdrop-filter: none;
  text-shadow: 0px 0px 6px #000000;
}

#header {
  background: rgb(0, 0, 0) url(/static/configuration/logos.png) no-repeat 10px 10px;
  background: rgba(0, 0, 0, 0.5) url(/static/configuration/logos.png) no-repeat 10px 10px;
  color: #eaeaea;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: $banner-height;
  padding: 0;
  margin: 0;
  white-space: nowrap;
  backdrop-filter: blur(5px);
}
#header #title {
  margin: 10px;
}
h1 {
  position: absolute;
  width: 100%;
  font-weight: bold;
  text-align: center;
  margin-top: 0;
  top: 28px;
}
h1.hasSubtitle {
  top: 14px;
}
h2 {
  position: absolute;
  width: 100%;
  font-weight: bold;
  text-align: center;
  top: 55px;
  margin-top: 0;
  font-size: 22px;
}
ul#languageLinks {
  position: absolute;
  right: 12px;
  /*top: 67px;*/
  top: 10px;
  margin: 0;
}
ul.buttons li {
  display: inline;
  font-weight: bold;
  margin-left: 10px;
}
ul.buttons li a {
  color: #aaa;
  text-decoration: none;
}
ul.buttons li span {
  color: #ececec;
  cursor: default;
  text-decoration: none;
}
ul.buttons li a:hover {
  color: $highlight-color;
}
ul#tools {
  position: absolute;
  right: 12px;
  bottom: 8px;
  margin: 0;
}
ul#tools li a {
  color: #ececec;
  text-decoration: none;
}
ul#tools li a:hover, ul#tools li a#logout-button:hover {
  color: $highlight-color;
}
ul#tools li a#logout-button {
  color: #f00;
}
</style>
