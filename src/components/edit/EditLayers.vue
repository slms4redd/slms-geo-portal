<template>
  <modal v-if="editLayers" id="edit-layers-modal">
    <h1 slot="header">Edit layers</h1>
    <div slot="body" class="layer-editor">
      <div id='master'>
        <a href="#" class="button default" @click.prevent="addLayer('wms')">Add a GeoServer (WMS) layer</a>
        <br>
        <a href="#" class="button default" @click.prevent="addLayer('osm')">Add a OSM layer</a>
        <br>
        <a href="#" class="button default" @click.prevent="addLayer('bing')">Add a Bing Aerial layer</a>
        <br>
        <a href="#" class="button default" @click.prevent="addLayer('esri')">Add an ESRI layer</a>
        <br>
        <a href="#" class="button default" @click.prevent="addLayer('google')">Add a Google layer</a>
        <br>
        <b>Drag to change the order</b>
        <br>
        <br>
        <draggable element="ul" :options="{ group: 'items', animation: 150, handle: '.handle' }" v-model='layersClone'>
          <li v-for="l in layersClone" class="layer-link" :class="{ highlighted: layer && l.id === layer.id }" @click="editLayer(l)" :key="l.id">
            <span class="handle"><icon name="sort"></icon></span>
            <span v-if="l.type === 'wms'">{{l.name}}</span>
            <span v-else-if="l.type === 'bing-aerial'">Bing aerial</span>
            <span v-else-if="l.type === 'google'">Google</span>
            <span v-else-if="l.type === 'osm'">Open street map</span>
            <span v-else-if="l.type === 'esri'">ESRI</span>
            <span v-if="l.statistics && l.statistics.length">
              <icon name="bar-chart"></icon>
            </span>
            <span v-if="l.downloadLink && l.downloadLink.length">
              <icon name="download"></icon>
            </span>
            <span v-if="l.legend">
              <icon name="th-list"></icon>
            </span>
            <span v-if="l.times && l.times.length">
              <icon name="clock-o"></icon>
            </span>
          </li>
        </draggable>
      </div>

      <div id="detail" v-if="layer">
        <a href="#" class="button default" @click.prevent="deleteLayer(layer)">Delete this layer</a>

        <template v-if="layer.type === 'wms'">
          <br>
          <!-- <input class="short-input" id="custom-urls" type="checkbox" :checked="serverUrlsCsv !== null" @change="toggleCustomUrls"> -->
          <!-- <label class="short-input" for="custom-urls">Custom server urls (csv)</label> -->

          <label class="mandatory">Server urls: <input type="text" v-model="serverUrlsCsv"></label>

          <button class="small" @click="fetchWmsLayers">Refresh list of layers</button>
          <br><br>

          <label class="mandatory">WMS name:
            <input type="text" v-model.lazy="layer.name" list="wms_servers">
            <datalist id="wms_servers" v-if="wmsLayers && !getCapabilitiesError">
              <option v-for="(option, index) in wmsLayers.map(l => l.Name[0])" :value="option" :key="`opt-${index}`">
                {{option}}
              </option>
            </datalist>
          </label>

          <span v-if="getCapabilitiesError" style="color:red">Error getting wms layers</span>

          <localized-text-input v-model="layer.styles" label="Styles (leave empty for default style):" :options="wmsStyleNames"></localized-text-input>

          <br>
          <label>Image format:
            <select v-model="layer.imageFormat">
              <option>image/jpeg</option>
              <option>image/gif</option>
              <option>image/png</option>
              <option>image/png8</option>
            </select>
          </label>

          <br>
          <label><input type="checkbox" v-model="layer.visible"> Visible</label>

          <br>
          <label>Source link: <input type="text" v-model="layer.sourceLink"></label>
          <label>Source label: <input type="text" v-model="layer.sourceLabel"></label>

          <label class="short-input">Legend:
            <select class="short-input" v-model="legendType">
              <option value="">none</option>
              <option>url</option>
              <option>wms</option>
            </select>
          </label>

          <label v-if="legendType === 'wms'" class="short-input mandatory">Style name: <input class="short-input" type="text" v-model="layer.legend.style"></label>

          <label v-else-if="legendType === 'url'" class="short-input mandatory">URL: <input class="short-input" type="text" v-model="layer.legend.url"></label>
<!--
          <label>Times
            <select>
              <option>None</option>
              <option>List</option>
              <option>From server</option>
            </select>
          </label>
 -->
          <label>Times: <input type="text" v-model="timesCsv"></label>

          <br>
          <b>Statistics</b>
          <br>
          Add statistics - type:
          <a href="#" class="button default" @click.prevent="addUrlStatistics">URL</a>
          <a href="#" class="button default" @click.prevent="addAttributesStatistics">Attributes</a>
          <div v-for="(statistics, index) in layer.statistics" class="section-edit" :key="`statistic-${index}`">
            Statistics - type: {{statistics.type}}
            <a href="#" class="button default" @click.prevent="deleteStatistics(statistics)">Delete statistics</a>

            <localized-text-input v-model="statistics.labels" label="Statistics labels:"></localized-text-input>

            <template v-if="statistics.type === 'url'">
              <label class="mandatory">URL: <input type="text" v-model="statistics.url"></label>
            </template>
            <template v-if="statistics.type === 'attributes'">
              Attributes:
              <br>
              <a href="#" class="button default" @click.prevent="addAttribute(statistics)">Add attribute</a>
              <br>
              <div v-for="(attribute, index) in statistics.attributes" class="section-edit" :key="`attrib-${index}`">
                <label class="short-input mandatory">Name: <input class="short-input" type="text" v-model="attribute.attribute"></label>

                <localized-text-input v-model="attribute.labels" label="Labels:"></localized-text-input>

                <a href="#" class="button default" @click.prevent="deleteAttribute(statistics, attribute)">Delete attribute</a>
                <br>
              </div>
            </template>
          </div>
          <br/>
          <br/>
          <b>Download Links</b>
          <br/>
          <a href="#" class="button default" @click.prevent="addDownloadLink">Add download link</a>
          <div v-for="(downloadLink, index) in layer.downloadLinks" class="section-edit" :key="`dwnlink-${index}`">
            <a href="#" class="button default right" @click.prevent="deleteDownloadLink(downloadLink)">Remove Link</a>
            <template>
              <label class="mandatory">URL: <input type="text" v-model="downloadLink.url"></label>
            </template>
            <localized-text-input v-model="downloadLink.labels" label="Link Labels"></localized-text-input>

          </div>

        </template>
      </div>
      <div id="detail" v-else>
        <b>Please select a layer on the left</b>
      </div>
    </div>
    <div slot="footer">
      <a href="#" class="modal-default-button" @click.prevent="close">Cancel</a>
      <a href="#" class="modal-default-button" @click.prevent="save">Ok</a>
    </div>
  </modal>
</template>

<script>
import Modal from '../Modal'
import LocalizedTextInput from './LocalizedTextInput'
import { mapState } from 'vuex'

import Layer from '../../layersConfig/layer'
import { getLocalizedLabels } from '../../layersConfig/util'
import httpRequest from '../../httpRequest'

import Icon from 'vue-awesome/components/Icon'

import xml2js from 'xml2js'
import vuedraggable from 'vuedraggable'

import 'vue-awesome/icons/sort'
import 'vue-awesome/icons/bar-chart'
import 'vue-awesome/icons/th-list'
import 'vue-awesome/icons/download'

export default {
  data() {
    return {
      layersClone: null,
      layer: null,
      serverUrlsCsv: null,
      timesCsv: '',
      wmsLayers: null,
      wmsStyleNames: null,
      getCapabilitiesError: false
    }
  },
  components: {
    Modal,
    LocalizedTextInput,
    Icon,
    'draggable': vuedraggable
  },
  methods: {
    fetchWmsLayers() {
      if (this.layer && this.layer.type === 'wms') {
        const baseUrl = this.layer.serverUrls[0]
        const lastChar = baseUrl.slice(-1)
        let sep
        if (lastChar === '?' || lastChar === '$') sep = ''
        else sep = baseUrl.indexOf('?') === -1 ? '?' : '&'

        const url = `${baseUrl}${sep}service=wms&version=1.1.1&request=GetCapabilities`
        httpRequest('GET', url).then(xml => {
          xml2js.parseString(xml, (err, result) => {
            if (err) throw err
            this.wmsLayers = result.WMT_MS_Capabilities.Capability[0].Layer[0].Layer

            const layer = this.wmsLayers.find(l => l.Name[0] === this.layer.name)
            if (layer && layer.Style) this.wmsStyleNames = layer.Style.map(s => s.Name[0])
            else this.wmsStyleNames = null
          })
          this.getCapabilitiesError = false
        })
        .catch(err => {
          err // jslint expects error to be handled
          this.getCapabilitiesError = true
        })
      }
    },
    addLayer(type) {
      let layer
      switch (type) {
        case 'wms':
          layer = new Layer({
            type: 'wms',
            name: '',
            id: Layer.nextId++,
            imageFormat: 'image/png8',
            visible: true
          })
          break
        case 'osm':
          layer = new Layer({
            type: 'osm',
            id: Layer.nextId++
          })
          break
        case 'bing':
          layer = new Layer({
            type: 'bing-aerial',
            id: Layer.nextId++
          })
          break
        case 'google':
          layer = new Layer({
            type: 'google',
            id: Layer.nextId++
          })
          break
        case 'esri':
          layer = new Layer({
            type: 'esri',
            id: Layer.nextId++
          })
          break
      }

      if (layer) {
        this.layersClone.push(layer)
        this.layer = layer
      }
    },
    editLayer(layer) {
      this.layer = layer
    },
    deleteLayer(layer) {
      const index = this.layersClone.indexOf(layer)
      if (index > -1) this.layersClone.splice(index, 1)
      this.layer = null
    },
    deleteStatistics(statistics) {
      if (confirm('Are you sure you want to delete the statistics?')) {
        const index = this.layer.statistics.indexOf(statistics)
        if (index > -1) this.layer.statistics.splice(index, 1)
      }
    },
    deleteDownloadLink(downloadLink) {
      if (this.layer.downloadLinks) {
        if (confirm('Are you sure you want to delete this link?')) {
          const index = this.layer.downloadLinks.indexOf(downloadLink)
          if (index > -1) {
            this.layer.downloadLinks.splice(index, 1)
          }
        }
      }
    },
    addUrlStatistics() {
      if (!this.layer.statistics) this.$set(this.layer, 'statistics', [])
      this.layer.statistics.push({
        type: 'url',
        url: '',
        labels: getLocalizedLabels()
      })
    },
    addAttributesStatistics() {
      if (!this.layer.statistics) this.$set(this.layer, 'statistics', [])
      this.layer.statistics.push({
        type: 'attributes',
        labels: getLocalizedLabels()
      })
    },
    addDownloadLink() {
      if (!this.layer.downloadLinks) {
        this.$set(this.layer, 'downloadLinks', [])
      }
      this.layer.downloadLinks.push({
        url: '',
        labels: getLocalizedLabels()
      })
    },
    addAttribute(statistics) {
      if (!statistics.attributes) this.$set(statistics, 'attributes', [])
      statistics.attributes.push({ labels: getLocalizedLabels(), attribute: null })
    },
    deleteAttribute(statistics, attribute) {
      if (confirm('Are you sure you want to delete the attribute?')) {
        const index = statistics.attributes.indexOf(attribute)
        if (index > -1) statistics.attributes.splice(index, 1)
        if (!statistics.attributes.length) this.$set(statistics, 'attributes', undefined)
      }
    },
    save() {
      // Housekeeping before saving
      this.layersClone.forEach(layer => {
        // Delete statistics array if empty
        if (layer.statistics && layer.statistics.length === 0) layer.statistics = null

        // Set each localized style to null if empty string
        // Only wms layers have the styles attribute
        if (layer.styles) layer.styles.forEach(s => { s.label = s.label || null })
      })

      this.$store.commit('update_layers', { value: this.layersClone })
      this.close()
    },
    close() {
      this.$store.commit('edit_layers', { edit: null })
      this.layer = null
    }
  },
  watch: {
    editLayers() {
      // Deep clone the layers vector
      this.layersClone = JSON.parse(JSON.stringify(this.layers))
    },
    layer(layer) {
      if (layer) {
        if (layer.serverUrls) {
          this.serverUrlsCsv = layer.serverUrls.join(',')
          this.fetchWmsLayers()
        }
        if (layer.times) this.timesCsv = layer.times.map(t => t.iso8601).join(',')
      } else {
        this.serverUrlsCsv = null
        this.timesCsv = ''
        this.wmsLayers = null
        // this.selectedWmsName = null
        this.getCapabilitiesError = false
      }
    },
    serverUrlsCsv(csv) {
      // TODO remove circularity (layer => serverUrlsCsv => layer.serverUrls)
      if (this.layer) {
        this.layer.serverUrls = csv !== null && csv.split(',').map(url => url.trim())
      }
    },
    timesCsv(csv) {
      csv = csv.trim()
      if (this.layer) {
        if (csv !== '') {
          this.layer.times = csv.split(',').map(time => ({
            iso8601: time.trim(),
            humanReadable: time.trim()
          }))
        } else this.layer.times = []
      }
    }
  },
  computed: {
    legendType: {
      get() {
        if (!this.layer.legend) return ''
        return this.layer.legend.type
      },
      set(type) {
        switch (type) {
          case 'wms':
            this.layer.legend = { type: 'wms', 'style': '' }
            break
          case 'url':
            this.layer.legend = { type: 'url', 'style': '' }
            break
          case '':
            this.layer.legend = undefined
        }
      }
    },
    ...mapState([
      'editLayers',
      'layers'
    ])
  }
}
</script>

<style scoped>
#master, #detail {
  /* max-height: 500px; */
  /* overflow: auto; */
}
#detail {
  width: 800px;
}
h1 {
  font-size: 16px;
}
.layer-link {
  cursor: pointer;
}
.layer-editor {
  /*width: 700px;*/
  /* overflow: hidden; add this to contain floated children */
  display: table;
}
li {
  list-style: none;
  padding-left: 0;
}
ul {
  padding: 0;
  margin: 0;
}
.handle {
  cursor: move;
}
#master {
  width: 250px;
  /* float:left;
  padding: 10px; */
  display: table-cell;
}
#detail {
  margin-left: 5px;
  /* float: left; */
  width: 530px;
  display: table-cell;
}
input[type=text] {
  width: 380px;
  display: block;
  margin-bottom: 9px;
}
label {
  display: block;
}
input[type=text].short-input {
  width: 110px;
  margin-bottom: 9px;
  display: inline;
}
label.short-input {
  display: inline;
}
.highlighted {
  font-weight: bold;
}
.section-edit {
  border: 1px dashed grey;
  padding: 8px;
  margin-top: 8px;
}
.section-edit {
  border: 1px dashed grey;
  padding: 8px;
  margin:8px
}
.mandatory {
  color: #f00;
  font-weight: bold;
}
.right {
  float: right;
};
</style>
