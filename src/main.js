import App from './App'
import store from './store'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import httpRequest from './httpRequest'

// const defaultLocales = {
//   en: {
//     title: "This is the portal!",
//     layerSelector: {
//       layers: "Layers"
//     }
//   },
//   fr: {
//     title: "C'est le portail!",
//     layerSelector: {
//       layers: "Couches"
//     }
//   }
// }

const mergeJSON = function(source, destination) {
  // TODO
  return source;
}

// install plugin
Vue.use(VueI18n)

// var self = this;
let lang = 'en';
Vue.locale(lang, function() {
  // self.loading = true
  return function(resolve, reject) {
    httpRequest(`../static/locale/${lang}.json`, (responseText) => {
      try {
        // const defaultLocale = defaultLocales[lang] || defaultLocales['en'] || {};
        // console.log(mergeJSON(JSON.parse(responseText), defaultLocale));
        // resolve(mergeJSON(JSON.parse(responseText), defaultLocale));
        resolve(JSON.parse(responseText));
      } catch(error) {
        alert(`Error loading language file for ${lang}:\n${error}`);
        reject();
      } 
    }, (httpError) => {
      alert(`Error loading language file for ${lang}:\n${httpError}`);
      reject();
    });
  }
}, function () {
  Vue.config.lang = lang;
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  template: '<App/>',
  components: { App }
})
