<template>
  <div id="header" :class="{ danger: user.authenticated }">
    <img id="header-img" src="/static/configuration/logos.gif"/>
    <div id="title">
      <h1 v-if="!isMobile" :class="{ hasSubtitle: $te('banner.subtitle') }">{{$t("banner.title")}}</h1>
      <h2 v-if="!isMobile && $te('banner.subtitle')">{{$t("banner.subtitle")}}</h2>
      <div v-if="isMobile" class="title-div" :class="{ hasSubtitle: $te('banner.subtitle') }">{{$t("banner.title")}}</div>
      <div v-if="isMobile && $te('banner.subtitle')" class="subtitle-div">{{$t("banner.subtitle")}}</div>
    </div>
    <div id="user-button">
      <div id="user-icon-container" @click="toggleUserPanel">
        <icon v-if="isMobile" class="user-icon" :class="{'icon-active': showUserPanel}" name="slms-user"/>
      </div>
      <div v-if="showUserPanel" class="transparent-panel user-panel">
        <p>{{$t("banner.languages")}}:</p>
        <div v-for="language in languages" :key="language.id" @click="setLanguage(language.id)">
          <icon :name="language.id === selectedLanguage ? 'dot-circle-o' : 'circle'"/>
          <span>{{language.label}}</span>
        </div>
        <div id="admin-button" @click="adminButtonClick">
          <icon :name="!user.authenticated ? 'slms-login' : 'slms-logout'"/>
          <span>{{!user.authenticated ? 'Admin' : 'Logout'}}</span>
        </div>
      </div>
    </div>
    <ul v-if="!isMobile && languages.length > 1" id="languageLinks" class="buttons">
      <li v-for="language in languages" :key="language.id">
        <span v-if="language.id === selectedLanguage" :href="'?lang=' + language.id">{{language.label}}</span>
         <a v-else href="#" @click="setLanguage(language.id)">{{language.label}}</a>
      </li>
    </ul>
    <ul v-if="!isMobile" id="tools" class="buttons">
      <li v-if="!user.authenticated">
        <a href="#" @click="showLoginDialog(true)">Admin</a>
      </li>
      <li v-else>
        <a id="logout-button" href="#" @click="logout">Logout</a>
      </li>
      <li>
        <a href="#" @click.stop.prevent="enableFeedback">{{$t("banner.feedback")}}</a>
      </li>
      <li>
        <a href="#" @click.prevent="enableUpload">{{$t("banner.uploadKml")}}</a>
      </li>
      <li>
        <a href="#" @click.stop.prevent="toggleMeasure">{{$t("banner.measure")}}</a>
      </li>
      <li v-if="enablePrint">
        <a href="#" @click.stop.prevent="printMap">PDF</a>
      </li>
    </ul>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import { languages } from 'config'
import auth from '../auth'
import tools from '../tools'

import { mapGetters, mapState } from 'vuex'

import 'vue-awesome/icons/dot-circle-o'
import 'vue-awesome/icons/circle'

export default {
  components: {
    Icon
  },
  data() {
    return {
      languages: languages,
      showUpload: false,
      showLogin: false,
      user: auth.user
    }
  },
  methods: {
    setLanguage(lang) {
      tools.setLanguage(lang)
    },
    enableFeedback() {
      tools.enableFeedback(this.$store, true)
    },
    enableUpload() {
      tools.enableUpload(this.$store, true)
    },
    logout() {
      auth.logout()
    },
    showLoginDialog() {
      tools.showLogin(this.$store, true)
    },
    toggleMeasure() {
      tools.toggleMeasure(this.$store, true)
    },
    printMap() {
      tools.printMap(this.$store, this.activeLayers, this.activeContexts, this.annotationLayer)
    },
    toggleUserPanel() {
      this.$store.commit('show_user_panel', { show: !this.showUserPanel })
    },
    adminButtonClick() {
      if (!this.user.authenticated) {
        this.showLoginDialog(true)
      } else {
        this.logout()
      }
    }
  },
  computed: {
    ...mapGetters([
      'activeLayers',
      'activeContexts',
      'annotationLayer'
    ]),
    ...mapState({
      isMobile: state => state.appMode === 'mobile',
      selectedLanguage: state => state.i18n.locale,
      enablePrint: state => state.enablePrint,
      showUserPanel: state => state.showUserPanel
    })
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/global.scss";

#header.danger {
  background: repeating-linear-gradient(
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
  background: rgb(0, 0, 0);
  background: rgba(0, 0, 0, 0.5);
  background-size: 30%;
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
  padding-bottom: 4px;
}
#header #title {
  margin: 10px;
}
$header-img-width: 64px;
$header-img-height: 36px;
$header-img-top: $banner-height * 0.5 - $header-img-height * 0.5;
$header-img-margin-left: 10px;
#header-img {
  position: relative;
  width: $header-img-width;
  height: $header-img-height;
  z-index: -1;
  top: $header-img-top;
  margin-left: $header-img-margin-left;
}
$user-small-button-height: 16px;
#user-button {
  position: absolute;
  width: 16px;
  height: $user-small-button-height;
  right: 10px;
  bottom: 6px;
}
#user-icon-container {
  width: inherit;
  height: inherit;
}
#user-button .user-icon {
  width: inherit;
  height: inherit;
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
#title .title-div {
  position: absolute;
  left: $header-img-width + $header-img-margin-left + 10px;
  top: $header-img-top;
  font-size: 15px;
  font-weight: bold;
}
#title .subtitle-div {
  position: absolute;
  left: $header-img-width + $header-img-margin-left + 10px;
  font-size: 13px;
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
.user-panel {
  position: absolute;
  right: -10px;
  top: $user-small-button-height + 6px;
  padding: 10px;

  svg {
    position: relative;
    top: 2px;
  }
}
#admin-button {
  margin-top: 16px;
}
@media screen and (min-width: 420px) {
  #header-img {
    margin-left: $header-img-margin-left + 6px;
  }
  #header {
    padding-bottom: 0;
  }
  #user-button {
    width: 32px;
    height: $header-img-height;
    right: $header-img-margin-left + 6px;
    top: $header-img-top;
    bottom: auto;
  }
  .user-panel {
    top: $header-img-height + 28px;
    right: -$header-img-margin-left - 6px;
  }
  #title .title-div {
    left: $header-img-width + $header-img-margin-left + 16px;
  }
  #title .subtitle-div {
    left: $header-img-width + $header-img-margin-left + 16px;
  }
}
@media screen and (min-width: 769px) {
  #header img {
    margin: 10px 0 0 10px;
    width: auto;
    height: auto;
    top: auto;
  }
}
</style>
