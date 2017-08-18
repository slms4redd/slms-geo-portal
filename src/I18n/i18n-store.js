// © vuex-i18n https://github.com/dkfbasel/vuex-i18n

/* vuex-i18n-store defines a vuex module to store locale translations. Make sure
** to also include the file vuex-i18n.js to enable easy access to localized
** strings in your vue components.
*/

// define a simple vuex module to handle locale translations
const i18nVuexModule = {
  state: {
    locale: null,
    fallback: null,
    translations: {}
  },
  mutations: {
    // set the current locale
    SET_LOCALE(state, { locale }) {
      state.locale = locale;
    },

    // add a new locale
    ADD_LOCALE(state, { locale, translations }) {
      // reduce the given translations to a single-depth tree
      state.translations[locale] = flattenTranslations(translations);

      // make sure to notify vue of changes (this might break with new vue versions)
      try {
        if (state.translations.__ob__) state.translations.__ob__.dep.notify();
      } catch (ex) {}
    },

    // remove a new locale
    REMOVE_LOCALE(state, { locale }) {
      // check if the given locale is present in the state
      if (state.translations.hasOwnProperty(locale)) {
        // check if the current locale is the given locale to remvoe
        if (state.locale === locale) {
          // reset the current locale
          state.locale = null;
        }

        // create a copy of the translations object
        const translationCopy = Object.assign({}, state.translations);

        // remove the given locale
        delete translationCopy[locale];

        // set the state to the new object
        state.translations = translationCopy;
      }
    },

    SET_FALLBACK_LOCALE(state, { locale }) {
      state.fallback = locale;
    }
  },
  actions: {
    // set the current locale
    setLocale(context, payload) {
      context.commit({
        type: 'SET_LOCALE',
        locale: payload.locale
      });
    },

    // add a new locale with translations
    addLocale(context, { locale, translations }) {
      context.commit({
        type: 'ADD_LOCALE',
        locale: locale,
        translations: translations
      });
    },

    loadLocale({ dispatch }, { locale, url }) {
      return fetch(url).then(response => {
        if (response.status !== 200) {
          // console.log(`Looks like there was a problem. Status Code: ${response.status}`);
          return Promise.reject(`Looks like there was a problem. Status Code: ${response.status}`);
        }
        return response.json().then(data => {
          dispatch('addLocale', { locale: locale, translations: data });
          return Promise.resolve();
        }).catch(e => Promise.reject(e));
      });
    },

    // remove the given locale translations
    removeLocale(context, { locale, translations }) {
      context.commit({
        type: 'REMOVE_LOCALE',
        locale: locale,
        translations: translations
      });
    },

    setFallbackLocale(context, { locale }) {
      context.commit({
        type: 'SET_FALLBACK_LOCALE',
        locale: locale
      });
    }

  }
};

// flattenTranslations will convert object trees for translations into a
// single-depth object tree
const flattenTranslations = function flattenTranslations(translations) {
  const flattened = {};

  for (const i in translations) {
    // check if the property is present
    if (!translations.hasOwnProperty(i)) continue;

    const translation = translations[i];

    // allow unflattened array of strings
    if (isArray(translation)) {
      if (translation.find(el => typeof el !== 'string')) {
        console.warn('i18n:', 'currently only arrays of strings are supported', translation);
      }

      flattened[i] = translation;
    } else if (typeof translation === 'object' && translation !== null) {
      const flatObject = flattenTranslations(translation);

      for (const x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;
        flattened[i + '.' + x] = flatObject[x];
      }
    } else {
      flattened[i] = translation;
    }
  }
  return flattened;
};

// check if the given object is an array
function isArray(obj) {
  return !!obj && Array === obj.constructor;
}

export default i18nVuexModule;
