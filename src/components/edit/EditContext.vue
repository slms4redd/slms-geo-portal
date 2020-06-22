<template>
  <modal v-if="editContext">
    <h1 slot="header">Edit context</h1>
    <div slot="body" id="edit">
      <localized-text-input v-model="labels" label="Labels:"></localized-text-input>
      <label>Info file:</label> <input type="text" v-model="infoFile">
      <label><input type="checkbox" v-model="active"> active by default</label>
      <br>
      Inline legend URL: <input type="text" v-model="inlineLegendUrl">
      <label>Layers:</label>
      <select v-model="selectedLayers" multiple id="layer-select">
        <option v-for="layer in layers" :value="layer.id" :key="layer.id">
          {{layer.label}}
        </option>
      </select>
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
import { languages } from 'config'

export default {
  data() {
    return {
      labels: null,
      infoFile: null,
      active: null,
      inlineLegendUrl: null,
      layers: null,
      selectedLayers: null
    }
  },
  components: {
    Modal,
    LocalizedTextInput
  },
  methods: {
    save() {
      this.$store.commit('save_context', {
        id: this.editContext.id,
        // label: this.label,
        labels: this.labels,
        infoFile: this.infoFile,
        active: this.active,
        inlineLegendUrl: this.inlineLegendUrl,
        layerIds: this.selectedLayers
      })

      this.close()
    },
    close() {
      this.$store.commit('edit_item', { id: null })
    }
  },
  watch: {
    editContext() {
      if (this.editContext) {
        this.exclusive = this.editContext.exclusive
        this.infoFile = this.editContext.infoFile

        this.labels = languages.map(l => {
          const loc = this.editContext.labels.find(l2 => l2.language === l.id)
          return {
            language: l.id,
            label: loc ? loc.label : null
          }
        })

        this.infoFile = this.editContext.infoFile
        this.active = this.editContext.active
        this.inlineLegendUrl = this.editContext.inlineLegendUrl
        this.layers = this.allLayers.map(l => {
          const ret = { id: l.id }
          if (l.type === 'wms') ret.label = l.name
          else if (l.type === 'esri') ret.label = 'ESRI'
          else if (l.type === 'bing-aerial') ret.label = 'Bing Aerial'
          else if (l.type === 'google') ret.label = 'Google'
          else if (l.type === 'osm') ret.label = 'OpenStreetMap'
          else ret.label = '???'
          return ret
        })
        this.selectedLayers = this.editContext.layers.map(l => l.id)
      }
    }
  },
  computed: {
    editContext() {
      return this.$store.state.editContext
    },
    allLayers() {
      return this.$store.state.layers
    }
  }
}
</script>

<style scoped>
h1 {
  font-size: 16px;
}
#edit {
  width: 340px;
}
input[type=text] {
  width: 300px;
  display: block;
  margin-bottom: 9px;
}
label {
  display: block;
}
#layer-select {
  width: 300px;
}
</style>
