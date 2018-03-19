<template>
  <modal v-if="editGroup">
    <h1 slot="header">Edit group</h1>
    <div slot="body" id="edit">
      <localized-text-input v-model="labels" label="Labels:"></localized-text-input>
      <label>Info file: <input type="text" v-model="infoFile"></label>
      <label><input type="checkbox" v-model="exclusive"> Exclusive</label>
      <label v-if="exclusive"><input type="checkbox" v-model="allowDisableAll"> Allow to disable all</label>
    </div>
    <div slot="footer">
      <a href="#" class="modal-default-button" @click.prevent="close">Cancel</a>
      <a href="#" class="modal-default-button" @click.prevent="save">Ok</a>
    </div>
  </modal>
</template>

<script>
import { mapState } from 'vuex'
import { languages } from 'config'
import Modal from '../Modal'
import LocalizedTextInput from './LocalizedTextInput'

export default {
  data() {
    return {
      labels: null,
      exclusive: null,
      allowDisableAll: null,
      infoFile: null
    }
  },
  components: {
    Modal,
    LocalizedTextInput
  },
  methods: {
    save() {
      this.$store.commit('save_group', {
        id: this.editGroup.id,
        labels: this.labels,
        exclusive: this.exclusive,
        allowDisableAll: this.exclusive ? !!this.allowDisableAll : undefined,
        infoFile: this.infoFile
      })

      this.close()
    },
    close() {
      this.$store.commit('edit_item', { id: null })
    }
  },
  watch: {
    editGroup() {
      if (this.editGroup) {
        // this.label = this.editGroup.label;
        this.exclusive = this.editGroup.exclusive
        this.allowDisableAll = this.editGroup.allowDisableAll
        this.infoFile = this.editGroup.infoFile
        this.labels = languages.map(l => {
          const loc = this.editGroup.labels.find(l2 => l2.language === l.id)
          return {
            language: l.id,
            label: loc ? loc.label : null
          }
        })
      }
    }
  },
  computed: mapState([
    'editGroup'
  ])
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
</style>
