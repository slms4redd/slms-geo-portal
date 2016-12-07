<template>
  <div id="header">
    <div id="title">
      <h1>{{$t("banner.title")}}</h1>
    </div>
    <ul id="languageLinks">
      <li v-for="language in languages"><a :href="'?lang=' + language.id">{{language.label}}</a></li>
      <!-- <li v-for="language in languages" @click="setLanguage(language.id)">{{language.label}}</li> -->
    </ul>
  </div>
</template>

<script>
import { languages } from '../assets/config.json'
import { config } from 'vue'

export default {
  data() {
    return {
      languages: languages
    }
  },
  methods: {
    setLanguage(id) {
      config.lang = id;
    }
  }
}

</script>

<style lang="scss" scoped>
@import "../assets/global.scss";

h1 {
  font-weight: normal;
}
#header {
  background: rgb(0, 0, 0);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: $banner-height;
  padding: 0;
  margin: 0;
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
  top: 67px;
  margin: 0;
}
ul#languageLinks li {
  display: inline;
  font-weight: bold;
  margin-left: 10px;
}
ul#languageLinks li a {
  color: white;
  text-decoration: none;
}
</style>
