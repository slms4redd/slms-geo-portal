<template>
  <span>
    <modal v-if="statisticsUrl" @close="hideStatistics()">
      <iframe width="840" height="600" slot="body" v-bind:src="statisticsUrl"></iframe>
    </modal>
    <modal v-if="popupAttributes" @close="hideStatistics()">
      <h1 slot="header">{{$t("featureInfo.attributes")}}</h1>
      <div slot="body">
        <table>
          <tr v-for="attr in popupAttributes">
            <th>{{attr.label}}</th>
            <td>{{attr.value}}</td>
          </tr>
        </table>
      </div>
    </modal>
    <div id="popup" class="ol-popup">
      <a href="#" id="popup-closer" class="ol-popup-closer"></a>
      <ul id="popup-content">
        <p class="caption">{{$t("featureInfo.moreData")}}</p>
        <li v-for="(stat, i) in statisticsConfs" @click="showStatistics(stat, statisticsFeatures[i])">{{statisticsLabels[i]}}</li>
      </ul>
    </div>
  </span>
</template>

<script>
/* global ol */

import { mapGetters, mapState } from 'vuex';
import map from '../map';
import httpRequest from '../httpRequest';
import Modal from './Modal';
import Vue from 'vue';
import { defaultGeoServerURLs } from '../assets/config.json';

// Add a vector layer to show the highlighted features
const highlightOverlay = new ol.layer.Vector({
  // style: (customize your highlight style here),
  source: new ol.source.Vector(),
  map: map
});

const processTemplate = function(template, feature) {
  const regex = /\$\((\w+)\)/g;
  return template.replace(regex, (match, p) => {
    const attributeName = match.substring(2, match.length - 1);
    return feature.getProperties()[attributeName];
  });
};

const processUrlTemplate = function(urlTemplate, feature) {
  return processTemplate(urlTemplate.replace('$(_lang)', Vue.config.lang), feature);
};

let container,
    closer,
    overlay;

export default {
  data() {
    return {
      statisticsLabels: [],
      statisticsConfs: [],
      statisticsFeatures: [],
      showStatisticsModal: false,
      statisticsUrl: null,
      popupAttributes: null
    };
  },
  components: {
    'modal': Modal
  },
  mounted() {
    container = document.getElementById('popup');
    closer = document.getElementById('popup-closer');

    closer.onclick = function() {
      overlay.setPosition(undefined);
      closer.blur();
      highlightOverlay.getSource().clear();

      return false;
    };

    overlay = new ol.Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    map.addOverlay(overlay);
  },
  watch: {
    layers() {
      const parser = new ol.format.GeoJSON();
      let baseURL;

      if (process.env.NODE_ENV === 'development') baseURL = '/gs/wms';
      else baseURL = defaultGeoServerURLs[0];

      // Store the click callback as a propery as we will need to unlisten the click handler
      if (!this.clickCallback) {
        this.clickCallback = function(event) {
          if (this.enableFeedback) return;

          if (!this.queryableLayers.length) {
            highlightOverlay.getSource().clear();
            overlay.setPosition(undefined);
          } else {
            this.statisticsConfs = [];
            this.statisticsLabels = [];
            this.statisticsFeatures = [];

            // Build the GetFeatureInfo request
            const mapSize = map.getSize(),
                  [width, height] = mapSize,
                  [evtx, evty] = event.pixel,
                  extent = map.getView().calculateExtent(mapSize),
                  layersStr = this.queryableLayers.map(layer => layer.name).join(','),
                  url = `${baseURL}?LAYERS=${layersStr}&QUERY_LAYERS=${layersStr}&STYLES=&SERVICE=WMS&VERSION=1.1.1` +
                        `&REQUEST=GetFeatureInfo&SRS=EPSG%3A900913&BBOX=${extent.join('%2C')}&FEATURE_COUNT=5` +
                        `&FORMAT=image%2Fpng&INFO_FORMAT=application%2Fjson&HEIGHT=${height}&WIDTH=${width}` +
                        `&X=${evtx}&Y=${evty}&EXCEPTIONS=application%2Fvnd.ogc.se_xml`;
            httpRequest('GET', url)
              .then(responseText => {
                const features = parser.readFeatures(responseText, { featureProjection: 'EPSG:3857' });

                highlightOverlay.getSource().clear();
                if (features.length) {
                  // Highlight the features on the map
                  highlightOverlay.getSource().addFeatures(features);

                  // Look for the related layer config objects (f.getId is of the form "provinces_simp.1")
                  const selectedFeaturesLayers = features.map(f =>
                    this.queryableLayers.find(l => {
                      // Remove the workspace, reasonabily assuming that it's safe
                      const pos = l.name.lastIndexOf(':');
                      const name = (pos > -1) ? l.name.substring(pos + 1) : name;
                      return name === f.getId().substring(0, f.getId().lastIndexOf('.'));
                    }));
                  features.forEach((feature, i) => {
                    const statistics = selectedFeaturesLayers[i].statistics;
                    statistics.forEach(stat => {
                      this.statisticsConfs.push(stat);
                      const template = stat.labels.find(l => l.language === Vue.config.lang).label;
                      this.statisticsLabels.push(template ? processTemplate(template, feature) : feature.getId());
                      this.statisticsFeatures.push(feature);
                    });
                  });
                  overlay.setPosition(event.coordinate);
                } else {
                  overlay.setPosition(undefined);
                }
              })
              .catch(error => alert(error.statusText || error));
          }
        }.bind(this);
      }

      // Delete previous click handler (needed when editing and changing the layers array)
      map.un('singleclick', this.clickCallback);

      this.handlerKey = map.on('singleclick', this.clickCallback);
    }
  },
  methods: {
    showStatistics(statsConf, feature) {
      const attributeLabel = function(attribute) {
        const loc = attribute.labels.find(l => l.language === Vue.config.lang);
        return loc ? loc.label : null;
      };

      switch (statsConf.type) {
        case 'url':
          const url = statsConf.url;
          this.statisticsUrl = processUrlTemplate(url, feature);
          break;
        case 'attributes':
          const attributes = statsConf.attributes;
          if (attributes) {
            this.popupAttributes = attributes.map(a => ({
              label: attributeLabel(a),
              value: feature.getProperties()[a.attribute] || 'n/a'
            }));
          } else {
            const t = [],
                  properties = feature.getProperties();
            for (const p in properties) {
              if (properties.hasOwnProperty(p) && p !== 'geometry') {
                t.push({ label: p, value: properties[p] });
              }
            }
            this.popupAttributes = t;
          }
          break;
        default:
          break;
      }
    },
    hideStatistics() {
      this.statisticsUrl = null;
      this.popupAttributes = null;
    }
  },
  computed: {
    ...mapState([
      'enableFeedback',
      'layers'
    ]),
    ...mapGetters([
      'queryableLayers'
    ])
  }
};
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

<style scoped>
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
</style>
