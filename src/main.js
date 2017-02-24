import App from './App'
import store from './store'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import httpRequest from './httpRequest'

// From http://stackoverflow.com/a/979995
const QueryString = function() {
  const query_string = {},
        pairs = window.location.search.substring(1).split("&").map(v => v.split('='));

  pairs.forEach(([k, v]) => {
    if (!query_string[k]) {
      // First entry with this name
      query_string[k] = decodeURIComponent(v);
    } else if (typeof query_string[k] === "string") {
      // Second entry with this name
      query_string[k] = [query_string[k], decodeURIComponent(v)];
    } else {
      // Third or later entry with this name
      query_string[k].push(decodeURIComponent(v));
    }
  });
  return query_string;
}();


const lang = QueryString.lang || 'en';

// install plugin
Vue.use(VueI18n);

// var self = this;
Vue.locale(lang, function() {
  // self.loading = true;
  return function(resolve, reject) {
    httpRequest(`../static/configuration/locale/${lang}.json`, (responseText) => {
      try {
        resolve(JSON.parse(responseText));
      } catch(error) {
        alert(`Error loading app:\n${error}`);
        reject();
      }
    }, (httpError) => {
      alert(`Error loading language file for ${lang}:\n${httpError}`);
      reject();
    });
  }
}, function () {
  Vue.config.lang = lang;
  new Vue({
    el: '#app',
    store,
    template: '<App/>',
    components: { App }
  });

  // If a geojson is provided as a http get parameter, overlay it to the map
  if (QueryString.geojson_overlay) {
    store.commit('overlay_geojson', { geoJson: JSON.parse(QueryString.geojson_overlay) });
  }
});

// Object.keys(locales).forEach(function (lang) {
//   Vue.locale(lang, locales[lang])
// })

/* eslint-disable no-new */
// new Vue({
//   el: '#app',
//   store,
//   template: '<App/>',
//   components: { App }
// });
