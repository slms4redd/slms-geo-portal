import App from './App'
import store from './store'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import httpRequest from './httpRequest'

const locales = {
  en: {
    banner: {
      title: "Sample NFMS portal"
    },
    layerSelector: {
      layers: "Layers"
    }
  },
  fr: {
    banner: {
      title: "Exemple de portail NFMS"
    },
    layerSelector: {
      layers: "Couches"
    }
  }
}

// const mergeJSON = function(source, destination) {
//   // TODO
//   return source;
// }

// install plugin
Vue.use(VueI18n);
// Vue.config.lang = 'fr'



// // var self = this;
// let lang = 'fr';
// Vue.locale(lang, function() {
//   // self.loading = true
//   return function(resolve, reject) {
//     httpRequest(`../static/locale/${lang}.json`, (responseText) => {
//       try {
//         // const defaultLocale = defaultLocales[lang] || defaultLocales['en'] || {};
//         // console.log(mergeJSON(JSON.parse(responseText), defaultLocale));
//         // resolve(mergeJSON(JSON.parse(responseText), defaultLocale));
//         resolve(JSON.parse(responseText));
//       } catch(error) {
//         alert(`Error loading language file for ${lang}:\n${error}`);
//         reject();
//       } 
//     }, (httpError) => {
//       alert(`Error loading language file for ${lang}:\n${httpError}`);
//       reject();
//     });
//   }
// }, function () {
//   Vue.config.lang = lang;
//   new Vue({
//     el: '#app',
//     store,
//     template: '<App/>',
//     components: { App }
//   });
// });



Object.keys(locales).forEach(function (lang) {
  Vue.locale(lang, locales[lang])
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  template: '<App/>',
  components: { App }
});
