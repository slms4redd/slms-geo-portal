<template>
  <span>
    <modal v-if="statisticsUrl" @close="hideStatistics()">
      <!--<h1 slot="header">Header</h1>-->
      <!--<div slot="body" v-html="content"></div>-->
      <iframe width="840" height="600" slot="body" v-bind:src="statisticsUrl"></iframe>
    </modal>
    <div id="popup" class="ol-popup">
      <a href="#" id="popup-closer" class="ol-popup-closer"></a>
      <ul id="popup-content">
        <h1>Get region data</h1>
        <li v-for="(layer, i) in selectedFeaturesLayers" @click="showStatistics(layer, features[i])">{{selectedFeaturesLabels[i]}}</li>
      </ul>
    </div>
  </span>
</template>

<script>
import { mapGetters } from 'vuex'
import map from '../map'
import httpRequest from '../httpRequest'
import Modal from './Modal'

// Add a vector layer to show the highlighted features
let highlightOverlay = new ol.layer.Vector({
  // style: (customize your highlight style here),
  source: new ol.source.Vector(),
  map: map
});

let container,
    content,
    closer,
    overlay;

export default {
  data() {
    return {
      tooltipCoords: false,
      selectedFeaturesLayers: [],
      selectedFeaturesLabels: [],
      showStatisticsModal: false,
      statisticsUrl: null
    }
  },
  components: {
    'modal': Modal
  },
  mounted() {
    container = document.getElementById('popup');
    content = document.getElementById('popup-content');
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
    tooltipCoords() {
      if (this.tooltipCoords) {
        let hdms = ol.coordinate.toStringHDMS(ol.proj.transform(this.tooltipCoords, 'EPSG:3857', 'EPSG:4326'));
        // content.innerHTML = '<p>You are here:</p><code>' + hdms + '</code>';
        overlay.setPosition(this.tooltipCoords);
      } else {
        overlay.setPosition(undefined);
      }
    },
    layersInited() {
      // TODO get the url from some config file
      const parser = new ol.format.WMSGetFeatureInfo(),
            srcProjection = new ol.proj.Projection({ code: "EPSG:4326" }),
            dstProjection = new ol.proj.Projection({ code: "EPSG:3857" });
      let baseURL = map.getLayers().getArray()[0].getSource().getUrls()[0];
      if (process.env.NODE_ENV === 'development') {
        baseURL = 'http://localhost:8080/gs';
      }

      map.on('singleclick', event => {
        if (this.queryableLayers.length) {
          // Build the GetFeatureInfo request
          const mapSize = map.getSize(),
                [width, height] = mapSize,
                [evtx, evty] = event.pixel,
                extent = map.getView().calculateExtent(mapSize),
                layersStr = this.queryableLayers.map(layer => layer.wmsName).join(','),
                url = `${baseURL}?LAYERS=${layersStr}&QUERY_LAYERS=${layersStr}&STYLES=&SERVICE=WMS&VERSION=1.1.1`
                       + `&REQUEST=GetFeatureInfo&SRS=EPSG%3A900913&BBOX=${extent.join('%2C')}&FEATURE_COUNT=5`
                       + `&FORMAT=image%2Fpng&INFO_FORMAT=application%2Fvnd.ogc.gml&HEIGHT=${height}&WIDTH=${width}`
                       + `&X=${evtx}&Y=${evty}&EXCEPTIONS=application%2Fvnd.ogc.se_xml`

          httpRequest(url, (responseText) => {
            this.features = parser.readFeatures(responseText);

            // Reproject the features from lat-lon to Google projection
            this.features.forEach(feature => {
              // ol3 bug workaround - see http://webmappingtutorial.blogspot.it/2015/08/swapping-coordinate-order-in-ol-3.html
              feature.getGeometry().applyTransform((coords, _, stride) => {
                for (let i = 0; i < coords.length; i += stride) {
                  const y = coords[i];
                  coords[i] = coords[i + 1];
                  coords[i + 1] = y;
                }
              });
              feature.getGeometry().transform(srcProjection, dstProjection);
            });

            highlightOverlay.getSource().clear();
            if (this.features.length) {
              // Highlight the features on the map
              highlightOverlay.getSource().addFeatures(this.features);

              // Look for the related layer config object (f.getId is of the form "provinces_simp.1")
              this.selectedFeaturesLayers = this.features.map(f =>
                this.layers.find(l =>
                  l.wmsName === f.getId().substring(0, f.getId().lastIndexOf('.'))));

              // Look for the related feature labels
              // Statistics is an array as more than one statistics per layer will be allowed in the very far future
              this.selectedFeaturesLabels = this.features.map((feature, i) =>
                feature.getProperties()[this.selectedFeaturesLayers[i].statistics[0].labelAttribute]);
              this.tooltipCoords = event.coordinate;
            } else {
              this.tooltipCoords = undefined;
            }

          }, (error) => {
            alert(error);
          });
        }
      });
    }
  },
  methods: {
    showStatistics(layer, feature) {
      const url = layer.statistics[0].url,
            regex = /\$\{(\w+)\}/g,
            result = [];

      this.statisticsUrl = url.replace(regex, (match, p) => {
        const attributeName = match.substring(2, match.length - 1);
        return feature.getProperties()[attributeName];
      });
    },
    hideStatistics() {
      this.statisticsUrl = null;
    }
  },
  computed: mapGetters([
    'layersInited',
    'layers',
    'queryableLayers'
  ])
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
</style>
