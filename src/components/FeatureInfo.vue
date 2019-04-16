<template>
  <span>
    <modal name="stats-modal" :draggable="true" :resizable=true :minWidth=250 :minHeight=220>
      <div class="modal-container">
        <h1 class="modal-header">{{$t("featureInfo.info")}}</h1>
        <iframe width=100% height=100% :src="statisticsUrl"/>
      </div>
    </modal>
    <modal name="props-modal" :draggable="true" :resizable=true :minWidth=250 :minHeight=220>
      <div class="modal-container">
        <h1 class="modal-header">{{$t("featureInfo.attributes")}}</h1>
        <div class="modal-body">
        <table>
            <tr v-for="attr in popupAttributes" :key="attr.id">
            <th>{{attr.label}}</th>
            <td>{{attr.value}}</td>
          </tr>
        </table>
      </div>
      </div>
    </modal>
    <div id="popup" class="ol-popup">
      <a href="#" id="popup-closer" class="ol-popup-closer"></a>
      <ul id="popup-content">
        <p class="caption">{{$t("featureInfo.moreData")}}</p>
        <li class="statsLink" v-for="(stat, i) in statisticsConfs" :key="i" @click="showStatistics(stat, statisticsFeatures[i])">{{statisticsLabels[i]}}</li>
      </ul>
    </div>
  </span>
</template>

<script>

import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Overlay from 'ol/Overlay'
import GeoJSON from 'ol/format/GeoJSON'
import { mapGetters, mapState } from 'vuex'
import map from '../map'
import httpRequest from '../httpRequest'
import Vue from 'vue'
import { map as mapConfig } from 'config'

// Add a vector layer to show the highlighted features
const highlightOverlay = new VectorLayer({
  // style: (customize your highlight style here),
  source: new VectorSource(),
  map: map
})

const processTemplate = function(template, feature) {
  const regex = /\$\((\w+)\)/g
  return template.replace(regex, (match, p) => {
    const attributeName = match.substring(2, match.length - 1)
    return feature.getProperties()[attributeName]
  })
}

const processUrlTemplate = function(urlTemplate, feature) {
  return processTemplate(urlTemplate.replace('$(_lang)', Vue.i18n.locale()), feature)
}

let container,
    closer,
    overlay

export default {
  data() {
    return {
      statisticsLabels: [],
      statisticsConfs: [],
      statisticsFeatures: [],
      showStatisticsModal: false,
      statisticsUrl: null,
      popupAttributes: null
    }
  },
  mounted() {
    container = document.getElementById('popup')
    closer = document.getElementById('popup-closer')

    closer.onclick = function() {
      overlay.setPosition(undefined)
      closer.blur()
      highlightOverlay.getSource().clear()

      return false
    }

    overlay = new Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    })
    map.addOverlay(overlay)
  },
  watch: {
    layers: {
      immediate: true,
      handler: function() {
        const parser = new GeoJSON()

        const baseURL = mapConfig.defaultGeoServerURLs[0]

        // Store the click callback as a property as we will need to unlisten the click handler
        if (!this.clickCallback) {
          this.clickCallback = function(event) {
            if (this.enableFeedback || this.measureActive) {
              return
            }

            if (!this.queryableLayers.length) {
              highlightOverlay.getSource().clear()
              overlay.setPosition(undefined)
            } else {
              this.statisticsConfs = []
              this.statisticsLabels = []
              this.statisticsFeatures = []

              // Build the GetFeatureInfo request
              const mapSize = map.getSize(),
                    [width, height] = mapSize,
                    [evtx, evty] = event.pixel,
                    extent = map.getView().calculateExtent(mapSize),
                    layersStr = this.queryableLayers.map(layer => layer.name).join(','),
                    url = `${baseURL}?LAYERS=${layersStr}&QUERY_LAYERS=${layersStr}&STYLES=&SERVICE=WMS&VERSION=1.1.1` +
                          `&REQUEST=GetFeatureInfo&SRS=EPSG%3A900913&BBOX=${extent.join('%2C')}&FEATURE_COUNT=5` +
                          `&FORMAT=image%2Fpng&INFO_FORMAT=application%2Fjson&HEIGHT=${height}&WIDTH=${width}` +
                          `&X=${Math.round(evtx)}&Y=${Math.round(evty)}&EXCEPTIONS=application%2Fvnd.ogc.se_xml`
              httpRequest('GET', url)
                .then(responseText => {
                  const features = parser.readFeatures(responseText, { featureProjection: 'EPSG:3857' })

                  highlightOverlay.getSource().clear()
                  if (features.length) {
                    // Highlight the features on the map
                    highlightOverlay.getSource().addFeatures(features)

                    // Look for the related layer config objects (f.getId is of the form "provinces_simp.1")
                    const selectedFeaturesLayers = features.map(f =>
                      this.queryableLayers.find(l => {
                        // Remove the workspace, reasonabily assuming that it's safe
                        const pos = l.name.lastIndexOf(':')
                        const name = (pos > -1) ? l.name.substring(pos + 1) : l.name
                        return name === f.getId().substring(0, f.getId().lastIndexOf('.'))
                      }))
                    features.forEach((feature, i) => {
                      const statistics = selectedFeaturesLayers[i].statistics
                      statistics.forEach(stat => {
                        this.statisticsConfs.push(stat)
                        const template = stat.labels.find(l => l.language === Vue.i18n.locale()).label
                        this.statisticsLabels.push(template ? processTemplate(template, feature) : feature.getId())
                        this.statisticsFeatures.push(feature)
                      })
                    })
                    overlay.setPosition(event.coordinate)
                  } else {
                    overlay.setPosition(undefined)
                  }
                })
                .catch(error => {
                  if (!(error instanceof SyntaxError)) {
                    alert(error.statusText || error)
                  }
                })
            }
          }.bind(this)
        }

        // Delete previous click handler (needed when editing and changing the layers array)
        map.un('singleclick', this.clickCallback)

        this.handlerKey = map.on('singleclick', this.clickCallback)
      }
    }
  },
  methods: {
    showStatistics(statsConf, feature) {
      const attributeLabel = function(attribute) {
        const loc = attribute.labels.find(l => l.language === Vue.i18n.locale())
        return loc ? loc.label : null
      }

      switch (statsConf.type) {
        case 'url':
          const url = statsConf.url
          this.statisticsUrl = processUrlTemplate(url, feature)
          this.$modal.show('stats-modal')
          break
        case 'attributes':
          const attributes = statsConf.attributes
          if (attributes) {
            this.popupAttributes = attributes.map(a => ({
              label: attributeLabel(a),
              value: feature.getProperties()[a.attribute] || 'n/a'
            }))
          } else {
            const t = [],
                  properties = feature.getProperties()
            for (const p in properties) {
              if (properties.hasOwnProperty(p) && p !== 'geometry') {
                t.push({ label: p, value: properties[p] })
              }
            }
            this.popupAttributes = t
          }
          this.$modal.show('props-modal')
          break
        default:
          break
      }
    },
    hideStatistics() {
      this.statisticsUrl = null
      this.popupAttributes = null
    }
  },
  computed: {
    ...mapState([
      'enableFeedback',
      'measureActive',
      'layers'
    ]),
    ...mapGetters([
      'queryableLayers'
    ])
  }
}
</script>

<style>
.ol-popup {
  position: absolute;
  background-color: white;
  -webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
  filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
}
.ol-popup:after, .ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}
.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}
.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
  color: #006ae8;
}
.ol-popup-closer:after {
  content: "✖";
}
</style>

<style lang="scss"  scoped>
@import "../assets/global.scss";

#popup-content {
  padding: 0;
  margin: 0;
  white-space: nowrap;
}
#popup-content li {
  list-style: none;
  cursor: pointer;
}
h1 {
  font-size: 16px;
}
th, td {
  font-size:14px;
}
th {
  padding-right: 9px;
}
.caption {
  font-size: 12px;
}
.statsLink {
  text-decoration: underline;
}
.statsLink:hover {
  color: $highlight-color;
}
.modal-header {
  text-align: center;
  width: 100%;
}
.modal-container iframe{
  max-height: 90%;
  border: none;
}
.modal-body {
  margin: 20px 0;
  max-height: 80%;
}
.modal-container {
  margin: auto;
  background-color: #fff;
  transition: opacity .2s ease;
  height: 100%;
  font-size: 14px;
  padding: 0px 20px 6px 20px;
}
</style>
