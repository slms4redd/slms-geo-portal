<template>
  <modal v-if="editContext">
    <h1 slot="header">Edit group</h1>
    <div slot="body">
      Label: <input v-model="label">
      <br>
      Labels:
      <br>
      <template v-for="label in labels">
        <label>{{label.language}}</label> <input v-model="label.label">
        <br>
      </template>
      <label>Info file:</label> <input v-model="infoFile">
      <br>
      <label><input type="checkbox" v-model="active"> active by default</label>
      <br>
      Inline legend URL: <input v-model="inlineLegendUrl">
      <br>
      <label>Layers:</label>
      <select v-model="selectedLayers" multiple>
        <option v-for="layer in layers" v-bind:value="layer.id">
          {{ layer.label }}
        </option>
      </select>

    </div>
    <div slot="footer">
      <a href="#" class="modal-default-button" @click.prevent="close">Cancel</a>
      <a href="#" class="modal-default-button" @click.prevent="save">Save</a>
    </div>
  </modal>
</template>

<script>
// {
import Modal from './Modal';
import { languages } from '../assets/config.json';

export default {
  data() {
    return {
      label: null,
      labels: null,
      infoFile: null,
      active: null,
      inlineLegendUrl: null,
      layers: null,
      selectedLayers: null
    };
  },
  components: {
    'modal': Modal
  },
  methods: {
    save() {
      console.log('saving');
      this.$store.commit('save_context', {
        id: this.editContext.id,
        label: this.label,
        labels: this.labels,
        infoFile: this.infoFile,
        active: this.active,
        inlineLegendUrl: this.inlineLegendUrl,
        layerIds: this.selectedLayers
      });

      this.close();
    },
    close() {
      this.$store.commit('edit_item', { id: null });
    }
  },
  watch: {
    selectedLayers() {
      console.log(this.selectedLayers);
    },
    editContext() {
      if (this.editContext) {
        this.label = this.editContext.label;
        this.exclusive = this.editContext.exclusive;
        this.infoFile = this.editContext.infoFile;

        // Look localized labels. If not found, use a default text
        this.labels = languages.map(l => {
          const loc = this.editContext.labels.find(l2 => l2.language === l.id);
          return {
            language: l.id,
            label: loc ? loc.label : this.label || 'label ' + l.id
          };
        });

        this.infoFile = this.editContext.infoFile;
        this.active = this.editContext.active;
        this.inlineLegendUrl = this.editContext.inlineLegendUrl;
        this.layers = this.allLayers.map(l => ({ id: l.id, label: l.id })); // TODO
        this.selectedLayers = this.editContext.layers.map(l => l.id);
      }
    }
  },
  computed: {
    editContext() {
      return this.$store.state.editContext;
    },
    allLayers() {
      return this.$store.state.layers;
    }

  }
};
</script>

<style scoped>
h1 {
  font-size: 16px;
}
</style>
