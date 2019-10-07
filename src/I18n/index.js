// This is a MODIFIED VERSION OF vuex-i18n
// © vuex-i18n https://github.com/dkfbasel/vuex-i18n

// import the vuex module for localization
import i18nVuexModule from './i18n-store'

// import the corresponding plugin for vue
import I18nPlugin from './i18n-plugin'

// export both modules as one file
export default {
  store: i18nVuexModule,
  plugin: I18nPlugin
}
