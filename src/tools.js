import Vue from 'vue'
import { printApi } from 'config'

import { getPrintRequest } from './layersConfig'

export default {
  enableFeedback: ($store) => {
    $store.commit('enable_feedback', { enable: true })
  },
  enableUpload: ($store) => {
    $store.commit('show_file_drop_modal', { show: true })
  },
  showLogin: ($store) => {
    $store.commit('show_login_modal', { show: true })
  },
  toggleMeasure: ($store) => {
    $store.commit('toggle_measure', { enable: true })
  },
  setLanguage(lang) {
    Vue.i18n.load(lang, `static/configuration/locale/${lang}.json`).then((a) => {
      Vue.i18n.set(lang)
    }).catch(e => alert('Error loading language file: ' + e))
  },
  printMap($store, activeLayers, activeContexts, annotationLayer) {
    $store.commit('set_printing_in_progress', { inProgress: true })

    // see https://nehalist.io/downloading-files-from-post-requests/
    const printRequest = getPrintRequest(activeLayers, activeContexts, Vue.i18n.locale(), annotationLayer)

    const geoserverUrl = printApi.url
    const request = new XMLHttpRequest()
    request.open('POST', geoserverUrl, true)
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    request.responseType = 'blob'

    request.onload = function() {
      // Only handle status code 200
      if (request.status === 200) {
        // Try to find out the filename from the content disposition `filename` value
        const disposition = request.getResponseHeader('content-disposition')
        const matches = /"([^"]*)"/.exec(disposition)
        const filename = (matches != null && matches[1] ? matches[1] : 'map.pdf')

        // The actual download
        const blob = new Blob([request.response], { type: 'application/pdf' })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = filename

        document.body.appendChild(link)

        link.click()

        document.body.removeChild(link)
      }

      $store.commit('set_printing_in_progress', { inProgress: false })
      // TODO error handling
    }
    request.send(`spec=${encodeURIComponent(JSON.stringify(printRequest))}`)
  }
}
