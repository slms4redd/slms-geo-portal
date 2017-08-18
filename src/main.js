import App from './App';
import store from './store';
import Vue from 'vue';
import auth from './auth';
import I18n from './I18n';

// © http://stackoverflow.com/a/979995
const httpGetParams = (function() {
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

// initialize the internationalization plugin on the vue instance.
Vue.use(I18n.plugin, store);

// const browserLang = QueryString.lang || (navigator.language || navigator.userLanguage).substring(0, 2).toLowerCase();
// const lang = browserLang || 'en';
const lang = httpGetParams.lang || 'en';
Vue.i18n.load(lang, `../static/configuration/locale/${lang}.json`).catch(e => alert(e));
Vue.i18n.set(lang);
// TODO set fallback language

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  render: h => h(App)
});

// Check the users auth status when the app starts
auth.checkAuth();
