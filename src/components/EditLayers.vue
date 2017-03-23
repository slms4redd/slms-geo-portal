<template>
  <modal v-if="editLayers">
    <h1 slot="header">Edit layers</h1>
    <div slot="body" class="layer-editor">
      <div id='master'>
        <b>Drag to change the order</b>
        <br>
        <br>
        <draggable element="ul" :options="{ group: 'items', animation: 150, handle: '.handle' }" v-model='layersClone'>
          <li v-for="l in layersClone" class="layer-link" v-bind:class="{ highlighted: layer && l.id === layer.id }" v-on:click="editLayer(l)">
            <span class="handle"><icon name="sort"></icon></span>
            <span v-if="l.type === 'WMS'">{{l.name}}</span>
            <span v-else-if="l.type === 'bing-aerial'">Bing aerial</span>
            <span v-else-if="l.type === 'OSM'">Open street map</span>
            <span v-if="l.statistics && l.statistics.length">
              <icon name="bar-chart"></icon>
            </span>
            <span v-if="l.legend">
              <icon name="th-list"></icon>
            </span>
          </li>
        </draggable>
      </div>

      <!-- "legend": { "type": "url", "url": "settlements.png" } -->

      <template v-if="layer">
        <div id="detail" v-if="layer.type='WMS'">
          <a href="#" class="button default" @click.prevent="deleteLayer(layer)">Delete this layer</a>

          <label>WMS name: <input type="text" v-model="layer.name"></label>
          <label>Image format: <input type="text" v-model="layer.imageFormat"></label>
          <label>Source link: <input type="text" v-model="layer.sourceLink"></label>
          <label>Source label: <input type="text" v-model="layer.sourceLabel"></label>

          <label class="short-text-input">Legend:
            <select class="short-text-input" v-model="legendType">
              <option value="">none</option>
              <option>url</option>
              <option>wms</option>
            </select>
          </label>

          <label v-if="legendType === 'wms'" class="short-text-input">Style: <input class="short-text-input" type="text" v-model="layer.legend.style"></label>
          <label v-else-if="legendType === 'url'" class="short-text-input">URL: <input class="short-text-input" type="text" v-model="layer.legend.url"></label>

          <br>
          <b>Statistics</b> - add
          <a href="#" class="button default" @click.prevent="addUrlStatistics">URL</a>
          <a href="#" class="button default" @click.prevent="addAttributesStatistics">Attributes</a>
          <hr>
          <template v-for="statistics in layer.statistics">
            Statistics - type: {{statistics.type}}
            <a href="#" class="button default" @click.prevent="deleteStatistics(statistics)">Delete statistics</a>
            <br>
            <br>
            <template v-if="statistics.type === 'url'">
              <label>Label: <input type="text" v-model="statistics.popupLabel"></label>
              <label>URL: <input type="text" v-model="statistics.url"></label>
            </template>
            <template v-if="statistics.type === 'attributes'">
              <label>Label: <input type="text" v-model="statistics.popupLabel"></label>
              Attributes:
              <a href="#" class="button default" @click.prevent="addAttribute(statistics)">Add</a>
              <br>
              <template v-for="attribute in statistics.attributes">
                <label class="short-text-input">Label: <input class="short-text-input" type="text" v-model="attribute.label"></label>
                -
                <label class="short-text-input">Attribute: <input class="short-text-input" type="text" v-model="attribute.attribute"></label>
                <a href="#" class="button default" @click.prevent="deleteAttribute(statistics, attribute)">Delete</a>
                <br>
              </template>
            </template>
            <hr>
          </template>
        </div>
      </template>
      <template v-else>
        <b>Please select a layer on the left</b>
      </template>
    </div>
    <div slot="footer">
      <a href="#" class="modal-default-button" @click.prevent="close">Cancel</a>
      <a href="#" class="modal-default-button" @click.prevent="save">Save</a>
    </div>
  </modal>
</template>

<script>
import Modal from './Modal';
import { mapState } from 'vuex';
import Icon from 'vue-awesome/components/Icon.vue';
import 'vue-awesome/icons/sort';
import 'vue-awesome/icons/bar-chart';
import 'vue-awesome/icons/th-list';

export default {
  data() {
    return {
      layersClone: null,
      layer: null
    };
  },
  components: {
    'modal': Modal,
    Icon
    // The draggable component is loaded dynamically
  },
  methods: {
    editLayer(layer) {
      // this.layer = JSON.parse(JSON.stringify(layer));
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
        url: ''
      });
    },
    addAttributesStatistics() {
      if (!this.layer.statistics) this.$set(this.layer, 'statistics', []);
      this.layer.statistics.push({ type: 'attributes' });
    },
    addAttribute(statistics) {
      if (!statistics.attributes) this.$set(statistics, 'attributes', []);
      statistics.attributes.push({ label: '', attribute: '' });
    },
    deleteAttribute(statistics, attribute) {
      if (confirm('Are you sure you want to delete the attribute?')) {
        const index = statistics.attributes.indexOf(attribute);
        if (index > -1) statistics.attributes.splice(index, 1);
      }
    },
    save() {
      this.layersClone.forEach(function(l) {
        if (l.statistics && l.statistics.length === 0) l.statistics = null;
      });
      this.$store.commit('update_layers', { value: this.layersClone });
      this.close();
    },
    close() {
      this.$store.commit('edit_layers', { value: false });
    }
  },
  watch: {
    editLayers() {
      // Deep clone the layers vector
      // this.layersClone = this.layers.slice();
      this.layersClone = JSON.parse(JSON.stringify(this.layers));
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
    // legend: {
    //   get() {
    //     return this.layer.legend || { type: null };
    //   },
    //   set(legend) {
    //     console.log('setting');
    //     if (legend.type) this.layer.legend = legend;
    //     else this.layer.legend = undefined;
    //   }
    // },
    ...mapState([
      'editLayers',
      'layers'
    ])
  }
  // computed: mapState([
  //   'editLayers',
  //   'layers'
  // ])
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
  width: 400px;
  display: block;
  margin-bottom: 9px;
}
label {
  display:block;
}
input[type=text].short-text-input {
  width: 110px;
  margin-bottom: 9px;
  display: inline;
}
label.short-text-input {
  display: inline;
}
.highlighted {
  font-weight: bold;
}
</style>
