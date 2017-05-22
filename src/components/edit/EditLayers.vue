<template>
  <modal v-if="editLayers">
    <h1 slot="header">Edit layers</h1>
    <div slot="body" class="layer-editor">
      <div id='master'>
        Add layer:
        <a href="#" class="button default" @click.prevent="addLayer('wms')">WMS</a>
        <a href="#" class="button default" @click.prevent="addLayer('osm')">OSM</a>
        <a href="#" class="button default" @click.prevent="addLayer('bing')">Bing</a>
        <br>
        <b>Drag to change the order</b>
        <br>
        <br>
        <draggable element="ul" :options="{ group: 'items', animation: 150, handle: '.handle' }" v-model='layersClone'>
          <li v-for="l in layersClone" class="layer-link" v-bind:class="{ highlighted: layer && l.id === layer.id }" v-on:click="editLayer(l)">
            <span class="handle"><icon name="sort"></icon></span>
            <span v-if="l.type === 'wms'">{{l.name}}</span>
            <span v-else-if="l.type === 'bing-aerial'">Bing aerial</span>
            <span v-else-if="l.type === 'osm'">Open street map</span>
            <span v-if="l.statistics && l.statistics.length">
              <icon name="bar-chart"></icon>
            </span>
            <span v-if="l.legend">
              <icon name="th-list"></icon>
            </span>
          </li>
        </draggable>
      </div>

      <div id="detail" v-if="layer">
        <a href="#" class="button default" @click.prevent="deleteLayer(layer)">Delete this layer</a>

        <template v-if="layer.type === 'wms'">
          <br>
          <input class="short-input" id="custom-urls" type="checkbox" :checked="layer.serverUrls !== null" v-on:change="toggleCustomUrls">
          <label class="short-input" for="custom-urls">Custom server urls (csv)</label>

          <label v-if="layer.serverUrls !== null">Server urls: <input type="text" v-model="serverUrlsCsv"></label>

          <label>WMS name: <input type="text" v-model="layer.name"></label>
          <label>Image format: <input type="text" v-model="layer.imageFormat"></label>
          <label>Source link: <input type="text" v-model="layer.sourceLink"></label>
          <label>Source label: <input type="text" v-model="layer.sourceLabel"></label>

          <label class="short-input">Legend:
            <select class="short-input" v-model="legendType">
              <option value="">none</option>
              <option>url</option>
              <option>wms</option>
            </select>
          </label>

          <label v-if="legendType === 'wms'" class="short-input">Style: <input class="short-input" type="text" v-model="layer.legend.style"></label>
          <label v-else-if="legendType === 'url'" class="short-input">URL: <input class="short-input" type="text" v-model="layer.legend.url"></label>

          <br>
          <b>Statistics</b>
          <br>
          Add statistics - type:
          <a href="#" class="button default" @click.prevent="addUrlStatistics">URL</a>
          <a href="#" class="button default" @click.prevent="addAttributesStatistics">Attributes</a>
          <div v-for="statistics in layer.statistics" class="statistics-edit">
            Statistics - type: {{statistics.type}}
            <a href="#" class="button default" @click.prevent="deleteStatistics(statistics)">Delete statistics</a>
            <br>
            Statistics labels:
            <br>
            <EditLabels :labels="statistics.labels"></EditLabels>
            <template v-if="statistics.type === 'url'">
              <label>URL: <input type="text" v-model="statistics.url"></label>
            </template>
            <template v-if="statistics.type === 'attributes'">
              Attributes:
              <br>
              <a href="#" class="button default" @click.prevent="addAttribute(statistics)">Add attribute</a>
              <br>
              <div v-for="attribute in statistics.attributes" class="attribute-edit">
                <label class="short-input">Name: <input class="short-input" type="text" v-model="attribute.attribute"></label>
                <br>
                Labels:
                <br>
                <EditLabels :labels="attribute.labels"></EditLabels>
                <a href="#" class="button default" @click.prevent="deleteAttribute(statistics, attribute)">Delete attribute</a>
                <br>
              </div>
            </template>
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
import Modal from '../Modal';
import EditLabels from './EditLabels';
import { Layer, getLocalizedLabels } from '../../config';
import { mapState } from 'vuex';
import Icon from 'vue-awesome/components/Icon.vue';

import 'vue-awesome/icons/sort';
import 'vue-awesome/icons/bar-chart';
import 'vue-awesome/icons/th-list';

import { defaultGeoServerURLs } from '../../assets/config.json';

export default {
  data() {
    return {
      layersClone: null,
      layer: null,
      serverUrlsCsv: null
    };
  },
  components: {
    'modal': Modal,
    EditLabels,
    Icon
    // The draggable component is loaded dynamically
  },
  methods: {
    toggleCustomUrls() {
      if (this.serverUrlsCsv !== null) this.serverUrlsCsv = null;
      else this.serverUrlsCsv = '';
    },
    addLayer(type) {
      let layer;
      switch (type) {
        case 'wms':
          layer = new Layer({
            type: 'wms',
            name: 'new_layer',
            id: Layer.nextId++,
            imageFormat: 'image/png8'
          });
          break;
        case 'osm':
          layer = new Layer({
            type: 'osm',
            id: Layer.nextId++
          });
          break;
        case 'bing':
          layer = new Layer({
            type: 'bing-aerial',
            id: Layer.nextId++
          });
          break;
      }

      if (layer) {
        this.layersClone.push(layer);
        this.layer = layer;
      }
    },
    editLayer(layer) {
      this.layer = layer;
    },
    deleteLayer(layer) {
      const index = this.layersClone.indexOf(layer);
      if (index > -1) this.layersClone.splice(index, 1);
      this.layer = null;
    },
    deleteStatistics(statistics) {
      if (confirm('Are you sure you want to delete the statistics?')) {
        const index = this.layer.statistics.indexOf(statistics);
        if (index > -1) this.layer.statistics.splice(index, 1);
      }
    },
    addUrlStatistics() {
      if (!this.layer.statistics) this.$set(this.layer, 'statistics', []);
      this.layer.statistics.push({
        type: 'url',
        url: '',
        labels: getLocalizedLabels()
      });
    },
    addAttributesStatistics() {
      if (!this.layer.statistics) this.$set(this.layer, 'statistics', []);
      this.layer.statistics.push({
        type: 'attributes',
        labels: getLocalizedLabels()
      });
    },
    addAttribute(statistics) {
      if (!statistics.attributes) this.$set(statistics, 'attributes', []);
      statistics.attributes.push({ labels: getLocalizedLabels(), attribute: null });
    },
    deleteAttribute(statistics, attribute) {
      if (confirm('Are you sure you want to delete the attribute?')) {
        const index = statistics.attributes.indexOf(attribute);
        if (index > -1) statistics.attributes.splice(index, 1);
        if (!statistics.attributes.length) this.$set(statistics, 'attributes', undefined);
      }
    },
    save() {
      this.layersClone.forEach(function(l) {
        if (l.statistics && l.statistics.length === 0) l.statistics = null;
        if (l.serverUrls) l.urls = l.serverUrls;
        else l.urls = defaultGeoServerURLs;
      });
      this.$store.commit('update_layers', { value: this.layersClone });
      this.close();
    },
    close() {
      this.$store.commit('edit_layers', { edit: null });
      this.layer = null;
    }
  },
  watch: {
    editLayers() {
      // Deep clone the layers vector
      this.layersClone = JSON.parse(JSON.stringify(this.layers));
    },
    layer(layer) {
      if (layer && layer.serverUrls) {
        this.serverUrlsCsv = layer.serverUrls.join(', ');
      } else {
        this.serverUrlsCsv = null;
      }
    },
    serverUrlsCsv(csv) {
      // TODO remove circularity (layer => serverUrlsCsv => layer.serverUrls)
      if (this.layer) {
        this.layer.serverUrls = csv && csv.split(',').map(url => url.trim());
      }
    }
  },
  computed: {
    legendType: {
      get() {
        if (!this.layer.legend) return null;
        return this.layer.legend.type;
      },
      set(type) {
        switch (type) {
          case 'wms':
            this.layer.legend = { type: 'wms', 'style': '' };
            break;
          case 'url':
            this.layer.legend = { type: 'url', 'style': '' };
            break;
          case null:
            this.layer.legend = undefined;
        }
      }
    },
    ...mapState([
      'editLayers',
      'layers'
    ])
  }
};
</script>

<style scoped>
h1 {
  font-size: 16px;
}
.layer-link {
  cursor: pointer;
}
.layer-editor {
  /*width: 700px;*/
  overflow: hidden; /* add this to contain floated children */
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
  float:left; /* add this */
  overflow-y: auto;
  padding: 10px;
}
#detail {
  margin-left: 20px;
  float: left; /* add this */
  width: 408px;
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
.statistics-edit {
  border: 1px dashed grey;
  padding: 8px;
  margin-top: 8px;
}
.attribute-edit {
  border: 1px dashed grey;
  padding: 8px;
  margin:8px
}
</style>
