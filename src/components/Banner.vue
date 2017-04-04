<template>
  <div id="header">
    <div id="title">
      <h1>{{$t("banner.title")}}</h1>
    </div>
    <ul id="languageLinks" class="buttons">
      <li v-for="language in languages">
        <span v-if="language.id === selectedLanguage" :href="'?lang=' + language.id">{{language.label}}</span>
        <a v-else :href="'?lang=' + language.id">{{language.label}}</a>
      </li>
    </ul>
    <ul id="tools" class="buttons">
      <li v-if="!user.authenticated">
        <a href="#" @click="showLoginDialog(true)">Admin</a>
      </li>
      <li v-else>
        <a href="#" @click="logout">Logout</a>
      </li>
      <li>
        <a href="#" @click.stop="enableFeedback">{{$t("banner.feedback")}}</a>
      </li>
      <li>
        <a href="#" @click="enableUpload">{{$t("banner.uploadKml")}}</a>
      </li>
    </ul>
    <fileDrop :show=showUpload v-on:disable="disableUpload"></fileDrop>
    <!--<LoginModal v-if="loggingIn" v-on:login="login"></LoginModal>-->
    <LoginModal :show=showLogin v-on:disable="showLoginDialog(false)"></LoginModal>
  </div>
</template>

<script>
import { languages } from '../assets/config.json';
import Vue from 'vue';
import FileDrop from './FileDrop';
import LoginModal from './LoginModal';
import auth from '../auth';

export default {
  components: {
    'fileDrop': FileDrop,
    LoginModal
  },
  data() {
    return {
      languages: languages,
      selectedLanguage: Vue.config.lang,
      showUpload: false,
      showLogin: false,
      user: auth.user
    };
  },
  methods: {
    setLanguage(id) {
      Vue.config.lang = id;
    },
    enableFeedback(e) {
      e.preventDefault();
      this.$store.commit('enable_feedback', { enable: true });
    },
    enableUpload(e) {
      e.preventDefault();
      this.showUpload = true;
    },
    disableUpload() {
      this.showUpload = false;
    },
    logout() {
      auth.logout();
    },
    showLoginDialog(show) {
      this.showLogin = show;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/global.scss";

h1 {
  font-weight: normal;
}
#header {
  background: rgb(0, 0, 0) url(/static/configuration/logos.png) no-repeat 0 0 10px 10px;
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
  font-weight: bold;
  text-align: center;
  padding-top: 8px;
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
ul#tools li a:hover {
  color: $highlight-color;
}
</style>
