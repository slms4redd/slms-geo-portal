import App from './App'
import store from './store'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import httpRequest from './httpRequest'

// From http://stackoverflow.com/a/979995
const QueryString = function() {
  const query_string = {},
        query = window.location.search.substring(1),
        vars = query.split("&");

  vars.forEach(v => {
    const pair = v.split("=");
    if (!query_string[pair[0]]) {
      // First entry with this name
      query_string[pair[0]] = decodeURIComponent(pair[1]);
    } else if (typeof query_string[pair[0]] === "string") {
      // Second entry with this name
      const arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
      query_string[pair[0]] = arr;
    } else {
      // Third or later entry with this name
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  })
  return query_string;
}();

const lang = QueryString.lang || 'en';

// install plugin
Vue.use(VueI18n);

// var self = this;
Vue.locale(lang, function() {
  // self.loading = true;
  return function(resolve, reject) {
    httpRequest(`../static/locale/${lang}.json`, (responseText) => {
      try {
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
  new Vue({
    el: '#app',
    store,
    template: '<App/>',
    components: { App }
  });
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
