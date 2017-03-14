import App from './App';
import store from './store';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import httpRequest from './httpRequest';

// From http://stackoverflow.com/a/979995
const QueryString = (function() {
  const queryString = {},
        pairs = window.location.search.substring(1).split('&').map(v => v.split('='));

  pairs.forEach(([k, v]) => {
    if (!queryString[k]) {
      // First entry with this name
      queryString[k] = decodeURIComponent(v);
    } else if (typeof queryString[k] === 'string') {
      // Second entry with this name
      queryString[k] = [queryString[k], decodeURIComponent(v)];
    } else {
      // Third or later entry with this name
      queryString[k].push(decodeURIComponent(v));
    }
  });
  return queryString;
})();

const lang = QueryString.lang || 'en';

// install plugin
Vue.use(VueI18n);

const self = this;
Vue.locale(lang, function() {
  self.loading = true;
  return httpRequest('GET', `../static/configuration/locale/${lang}.json`)
  .then(function(res) {
    return JSON.parse(res);
  }).then(function(json) {
    self.loading = false;
    if (Object.keys(json).length === 0) {
      return Promise.reject(new Error('locale empty'));
    } else {
      return Promise.resolve(json);
    }
  }).catch(function(error) {
    alert(`Error loading language file for ${lang}:\n${error.message}`);
    return Promise.reject();
  });
}, function() {
  /* eslint-disable no-new */
  Vue.config.lang = lang;
  new Vue({
    el: '#app',
    store,
    template: '<App/>',
    components: { App }
  });
});

// Vue.locale(lang, function() {
//   // self.loading = true;
//   return function(resolve, reject) {
//     httpRequest('GET', `../static/configuration/locale/${lang}.json`)
//       .then(responseText => {
//         try {
//           resolve(JSON.parse(responseText));
//         } catch (error) {
//           alert(`Error loading app:\n${error}`);
//           reject();
//         }
//       })
//       .catch(error => {
//         alert(`Error loading language file for ${lang}:\n${error.statusText}`);
//         reject();
//       });
//   };
// }, function() {
//   Vue.config.lang = lang;
//   new Vue({
//     el: '#app',
//     store,
//     template: '<App/>',
//     components: { App }
//   });

//   // If a geojson is provided as a http get parameter, overlay it to the map
//   // if (QueryString.geojson_overlay) {
//   //   store.commit('overlay_geojson', { geoJson: JSON.parse(QueryString.geojson_overlay) });
//   // }
// });

// Object.keys(locales).forEach(function (lang) {
//   Vue.locale(lang, locales[lang])
// })

// new Vue({
//   el: '#app',
//   store,
//   template: '<App/>',
//   components: { App }
// });
