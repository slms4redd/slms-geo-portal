<template>
  <div id="header" :class="{ danger: user.authenticated }">
    <div id="title">
      <h1 :class="{ hasSubtitle: $te('banner.subtitle') }">{{$t("banner.title")}}</h1>
      <h2 v-if="$te('banner.subtitle')">{{$t("banner.subtitle")}}</h2>
    </div>
    <ul id="languageLinks" class="buttons">
      <li v-for="language in languages" :key="language.id">
        <span v-if="language.id === selectedLanguage" :href="'?lang=' + language.id">{{language.label}}</span>
        <!-- <a v-else :href="'?lang=' + language.id">{{language.label}}</a> -->
         <a v-else href="#" @click="setLanguage(language.id)">{{language.label}}</a>
      </li>
    </ul>
    <ul id="tools" class="buttons">
      <li v-if="!user.authenticated">
        <a href="#" @click="showLoginDialog(true)">Admin</a>
      </li>
      <li v-else>
        <a id="logout-button" href="#" @click="logout">Logout</a>
      </li>
      <li>
        <a href="#" @click.stop="enableFeedback">{{$t("banner.feedback")}}</a>
      </li>
      <li>
        <a href="#" @click="enableUpload">{{$t("banner.uploadKml")}}</a>
      </li>
      <li>
        <a href="#" @click.stop="toggleMeasure">{{$t("banner.measure")}}</a>
      </li>
      <li>
        <a href="#" @click.stop="printMap">PDF</a>
      </li>
    </ul>
    <file-drop :show=showUpload @disable="disableUpload"></file-drop>
    <login-modal :show=showLogin @disable="showLoginDialog(false)"></login-modal>
  </div>
</template>

<script>
import { languages } from 'config'
import Vue from 'vue'
import FileDrop from './FileDrop'
import LoginModal from './LoginModal'
import auth from '../auth'

import printRequest from '../assets/print.json'
import map from '../map'
import { mapGetters } from 'vuex'

export default {
  components: {
    FileDrop,
    LoginModal
  },
  data() {
    return {
      languages: languages,
      selectedLanguage: Vue.i18n.locale(),
      showUpload: false,
      showLogin: false,
      user: auth.user
    }
  },
  methods: {
    setLanguage(lang) {
      Vue.i18n.load(lang, `../static/configuration/locale/${lang}.json`).then((a) => {
        Vue.i18n.set(lang)
        this.selectedLanguage = Vue.i18n.locale()
      }).catch(e => alert('Error loading language file: ' + e))
    },
    enableFeedback(e) {
      e.preventDefault()
      this.$store.commit('enable_feedback', { enable: true })
    },
    enableUpload(e) {
      e.preventDefault()
      this.showUpload = true
    },
    disableUpload() {
      this.showUpload = false
    },
    logout() {
      auth.logout()
    },
    showLoginDialog(show) {
      this.showLogin = show
    },
    toggleMeasure(e) {
      e.preventDefault()
      this.$store.commit('toggle_measure', { enable: true })
    },
    printMap(e) {
      // see https://nehalist.io/downloading-files-from-post-requests/
      e.preventDefault()

      // get the map scale
      // const scale = INCHES_PER_UNIT[units] * DOTS_PER_INCH * resolution;
      // console.log(ol.has.DEVICE_PIXEL_RATIO)
      // console.log(window.devicePixelRatio)
      const scales = [1128, 2256, 4513, 9027, 18055, 36111, 72223, 144447, 288895, 577790, 1155581,
        2311162, 4622324, 9244649, 18489298, 36978596, 73957193, 147914387, 295828775, 591657550]
      const scale = Math.round(39.37 * 90 * map.getView().getResolution())
      const printScale = scales.find(s => s >= scale) || scales.slice(-1)[0]

      printRequest.pages[0].center = map.getView().getCenter()
      printRequest.pages[0].scale = printScale

      const visibleActiveLayers = this.activeLayers.filter(layer => !!layer.visible)
      if (!visibleActiveLayers.length) return // TODO notify the user

      // Reverse the order of WMS layers only
      let reversedWmsGroups = visibleActiveLayers.reduce((grouped, layer) => {
        switch (layer.type) {
          case 'osm':
          case 'bing-aerial':
            grouped.push([layer])
            return grouped
          case 'wms':
            if (!grouped.length) grouped.push([])
            const lastGroup = grouped[grouped.length - 1]
            if (!lastGroup.length || (lastGroup[0].type === 'wms' && lastGroup[0].serverUrls[0] !== layer.serverUrls[0])) {
              lastGroup.unshift(layer)
              return grouped
            } else {
              grouped.push([layer])
              return grouped
            }
        }
      }, [])

      // Flatten the two level structure
      reversedWmsGroups = [].concat.apply([], reversedWmsGroups)

      // Layers
      printRequest.layers = reversedWmsGroups.map(layer => {
        if (!layer.visible) return null
        switch (layer.type) {
          case 'wms':
            return {
              type: 'wms',
              layers: [layer.name],
              baseURL: layer.serverUrls[0],
              format: layer.imageFormat
            }
          case 'osm':
            return {
              baseURL: 'http://a.tile.openstreetmap.org/',
              singleTile: false,
              type: 'OSM',
              maxExtent: [-20037508.3392, -20037508.3392, 20037508.3392, 20037508.3392],
              tileSize: [256, 256],
              extension: 'png',
              resolutions: [156543.0339, 78271.51695, 39135.758475, 19567.8792375, 9783.93961875, 4891.969809375, 2445.9849046875, 1222.99245234375, 611.496226171875, 305.7481130859375, 152.87405654296876, 76.43702827148438, 38.21851413574219, 19.109257067871095, 9.554628533935547, 4.777314266967774, 2.388657133483887, 1.1943285667419434, 0.5971642833709717]
            }
          default:
            return null
        }
      }).filter(l => !!l)

      // Legends - add all layer legends - not inline context ones
      // Build something like this:
        // "legends": [
        //   {
        //     "classes": [
        //       {
        //         "icons": [
        //           "http://www.rdc-snsf.org/portal/static/loc/en/images/ucl_2010.png"
        //         ],
        //         "name": ""
        //       }
        //     ],
        //     "name": "a class name"
        //   }
        // ]

      const legends = []
      printRequest.legends = this.activeContexts.forEach(context => {
        const contextLabel = context.labels.find(l => l.language === Vue.i18n.locale()).label // TODO check nulls
        if (context.inlineLegendUrl) {
          // Return the inline context legend
          legends.push({
            classes: [{
              icons: [context.inlineLegendUrl],
              name: ''
            }],
            name: contextLabel
          })
        } else if (context.hasLegends) {
          const legend = {
            classes: [],
            name: contextLabel
          }
          context.layers.forEach(l => {
            if (!l.legend) return

            // TODO - duplicate of ContextLegend.vue
            switch (l.legend.type) {
              case 'url':
                legend.classes.push({
                  // TODO - hard coded icons url
                  icons: [`http://localhost/static/configuration/loc/${Vue.i18n.locale()}/images/${l.legend.url}`],
                  name: ''
                })
                break
              case 'wms':
                // TODO add base url to legend url in case it's not there
                let legendUrl = null
                if (l.legend) {
                  // Custom legend if defined
                  const wmsLegendStyle = l.legend.style.replace('$(_lang)', Vue.i18n.locale())
                  legendUrl = `${l.serverUrls[0]}?LEGEND_OPTIONS=fontColor:000000;fontAntiAliasing:true&LAYER=${l.name}&STYLE=${wmsLegendStyle}&REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=18&HEIGHT=18&TRANSPARENT=true`
                } else if (l.styles) {
                  // Get legend URL from the (localized) style
                  // TODO fallback legend
                  const style = l.styles.find(l => l.language === Vue.i18n.locale())
                  const wmsLegendStyle = style ? style.label : null
                  legendUrl = `${l.serverUrls[0]}?LEGEND_OPTIONS=fontColor:000000;fontAntiAliasing:true&LAYER=${l.name}&STYLE=${wmsLegendStyle}&REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=18&HEIGHT=18&TRANSPARENT=true`
                }
                legend.classes.push({
                  icons: [legendUrl],
                  name: ''
                })
                break
              default:
                return
            }
          })
          legends.push(legend)
        }
      })

      printRequest.legends = legends.filter(l => !!l)

      const geoserverUrl = '/geoserver/pdf/print.pdf' // DEBUG
      const request = new XMLHttpRequest()
      request.open('POST', geoserverUrl, true)
      request.setRequestHeader('Content-Type', 'application/json')
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
        // some error handling should be done here...
      }
      request.send(JSON.stringify(printRequest))
    }
  },
  computed: mapGetters([
    'activeLayers',
    'activeContexts'
  ])
}
</script>

<style lang="scss" scoped>
@import "../assets/global.scss";

#header.danger {
  background: url('/static/configuration/logos.png') no-repeat 10px 10px,
  repeating-linear-gradient(
    135deg,
    rgba(255, 230, 0, 0.6),
    rgba(255, 230, 0, 0.6) 30px,
    rgba(0, 0, 0, 0.7) 30px,
    rgba(0, 0, 0, 0.7) 60px
  );
  backdrop-filter: none;
  text-shadow: 0px 0px 6px #000000;
}

#header {
  background: rgb(0, 0, 0) url(/static/configuration/logos.png) no-repeat 10px 10px;
  background: rgba(0, 0, 0, 0.5) url(/static/configuration/logos.png) no-repeat 10px 10px;
  color: #eaeaea;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: $banner-height;
  padding: 0;
  margin: 0;
  white-space: nowrap;
  backdrop-filter: blur(5px);
}
#header #title {
  margin: 10px;
}
h1 {
  position: absolute;
  width: 100%;
  font-weight: bold;
  text-align: center;
  margin-top: 0;
  top: 28px;
}
h1.hasSubtitle {
  top: 14px;
}
h2 {
  position: absolute;
  width: 100%;
  font-weight: bold;
  text-align: center;
  top: 55px;
  margin-top: 0;
  font-size: 22px;
}
ul#languageLinks {
  position: absolute;
  right: 12px;
  /*top: 67px;*/
  top: 10px;
  margin: 0;
}
ul.buttons li {
  display: inline;
  font-weight: bold;
  margin-left: 10px;
}
ul.buttons li a {
  color: #aaa;
  text-decoration: none;
}
ul.buttons li span {
  color: #ececec;
  cursor: default;
  text-decoration: none;
}
ul.buttons li a:hover {
  color: $highlight-color;
}
ul#tools {
  position: absolute;
  right: 12px;
  bottom: 8px;
  margin: 0;
}
ul#tools li a {
  color: #ececec;
  text-decoration: none;
}
ul#tools li a:hover, ul#tools li a#logout-button:hover {
  color: $highlight-color;
}
ul#tools li a#logout-button {
  color: #f00;
}
</style>
