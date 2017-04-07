import App from './App';
import store from './store';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import httpRequest from './httpRequest';
import auth from './auth';

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

const browserLang = QueryString.lang || (navigator.language || navigator.userLanguage).substring(0, 2).toLowerCase();
const lang = browserLang || 'en';

// install the vue-i18n plugin
Vue.use(VueI18n);

/* eslint-disable no-new */
Vue.locale(lang, () => {
  return httpRequest('GET', `../static/configuration/locale/${lang}.json`)
  .then(res => {
    const json = JSON.parse(res);
    if (Object.keys(json).length === 0) {
      return Promise.reject(new Error('locale empty'));
    }
    return Promise.resolve(json);
  }).catch(error => {
    alert(`Error loading language file for ${lang}:\n${error.message}`);
    return Promise.reject();
  });
}, () => {
  Vue.config.lang = lang;
  new Vue({
    el: '#app',
    store,
    template: '<App/>',
    components: { App }
  });
});

// Check the users auth status when the app starts
auth.checkAuth();
