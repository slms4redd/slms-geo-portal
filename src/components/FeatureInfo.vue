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

const parser = new GeoJSON()

const reflect = p => p.then(v => ({ v, layer: p.layer, status: 'fulfilled' }),
                             e => ({ e, layer: p.layer, status: 'rejected' }))

let container,
    closer,
    popup

const displayResults = (statisticsConfs, statisticsLabels, statisticsFeatures, event, accumulator, result) => {
  const features = parser.readFeatures(result.v, { featureProjection: 'EPSG:3857' })

  if (features.length) {
    // Highlight the features on the map
    highlightOverlay.getSource().addFeatures(features)

    features.forEach(feature => {
      if (result.layer) {
        const statistics = result.layer.statistics
        statistics.forEach(stat => {
          statisticsConfs.push(stat)
          const template = stat.labels.find(l => l.language === Vue.i18n.locale()).label
          statisticsLabels.push(template ? processTemplate(template, feature) : feature.getId())
          statisticsFeatures.push(feature)
        })
      }
    })
  }
  return accumulator + features.length
}

const clickHandler = function(event) {
  if (this.enableFeedback || this.measureActive) {
    return
  }
  popup.setPosition(undefined)
  highlightOverlay.getSource().clear()

  if (this.queryableLayers.length) {
    this.statisticsConfs = []
    this.statisticsLabels = []
    this.statisticsFeatures = []

    // Build the GetFeatureInfo request
    const mapSize = map.getSize(),
          [width, height] = mapSize,
          [evtx, evty] = event.pixel,
          extent = map.getView().calculateExtent(mapSize)

    const infoRequests = []
    this.queryableLayers.forEach(l => {
      const getinfourl = `${l.serverUrls && l.serverUrls.length && l.serverUrls[0]}` +
                `?LAYERS=${l.name}&QUERY_LAYERS=${l.name}&STYLES=&SERVICE=WMS&VERSION=1.1.1` +
                `&REQUEST=GetFeatureInfo&SRS=EPSG%3A900913&BBOX=${extent.join('%2C')}&FEATURE_COUNT=5` +
                `&FORMAT=image%2Fpng&INFO_FORMAT=application%2Fjson&HEIGHT=${height}&WIDTH=${width}` +
                `&X=${Math.round(evtx)}&Y=${Math.round(evty)}&EXCEPTIONS=application%2Fvnd.ogc.se_xml`
      const getInfoRequest = httpRequest('GET', getinfourl)
      getInfoRequest.layer = l
      infoRequests.push(getInfoRequest)
    })
    // When all the requests completed, filter the successful ones
    Promise.all(infoRequests.map(reflect)).then(function(results) {
      const fulfilled = results.filter(x => x.status === 'fulfilled')

      if (fulfilled.reduce(displayResults.bind(null, this.statisticsConfs, this.statisticsLabels, this.statisticsFeatures, event), 0) > 0) {
        popup.setPosition(event.coordinate)
      } else {
        popup.setPosition(undefined)
      }
    }.bind(this)
    )
  }
}

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
      popup.setPosition(undefined)
      closer.blur()
      highlightOverlay.getSource().clear()

      return false
    }

    popup = new Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    })
    map.addOverlay(popup)
  },
  watch: {
    layers: {
      immediate: true,
      handler: function() {
        // Store the click callback as a property as we will need to unlisten the click handler
        if (!this.clickCallback) {
          this.clickCallback = clickHandler.bind(this)
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
    }
  },
  computed: {
    ...mapState([
      'layers'
    ]),
    ...mapGetters([
      'queryableLayers',
      'measureActive',
      'enableFeedback'
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
