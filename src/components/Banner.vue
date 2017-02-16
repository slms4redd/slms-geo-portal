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
      <!-- <li v-for="language in languages" @click="setLanguage(language.id)">{{language.label}}</li> -->
    </ul>
    <ul id="feedback" class="buttons">
      <li>
        <a href="#" @click.stop=enableFeedback>Feedback</a>
      </li>
    </ul>
  </div>
</template>

<script>
import { languages } from '../assets/config.json'
import { config } from 'vue'

export default {
  data() {
    return {
      languages: languages,
      selectedLanguage: config.lang
    }
  },
  methods: {
    setLanguage(id) {
      config.lang = id;
    },
    enableFeedback(e) {
      e.preventDefault();
      this.$store.commit('enable_feedback', { enable: true })
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
ul#feedback {
  position: absolute;
  right: 12px;
  bottom: 8px;
  margin: 0;
}
ul#feedback li a {
  color: #ececec;
  text-decoration: none;
}
ul#feedback li a:hover {
  color: $highlight-color;
}
</style>
