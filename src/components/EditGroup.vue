<template>
  <modal v-if="editGroup">
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
      <label><input type="checkbox" v-model="exclusive"> Exclusive</label>
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
import { languages } from '../assets/config.json';

export default {
  data() {
    return {
      label: null,
      labels: null,
      exclusive: null,
      infoFile: null
    };
  },
  components: {
    'modal': Modal
  },
  methods: {
    save() {
      this.$store.commit('save_group', {
        id: this.editGroup.id,
        label: this.label,
        labels: this.labels,
        exclusive: this.exclusive,
        infoFile: this.infoFile
      });

      this.close();
    },
    close() {
      this.$store.commit('edit_item', { id: null });
    }
  },
  watch: {
    editGroup() {
      if (this.editGroup) {
        this.label = this.editGroup.label;
        this.exclusive = this.editGroup.exclusive;
        this.infoFile = this.editGroup.infoFile;
        // Look localized labels. If not found, use a default text
        this.labels = languages.map(l => {
          const loc = this.editGroup.labels.find(l2 => l2.language === l.id);
          return {
            language: l.id,
            label: loc ? loc.label : this.label || 'label ' + l.id
          };
        });
      }
    }
  },
  computed: mapState([
    'editGroup'
  ])
};
</script>

<style scoped>
h1 {
  font-size: 16px;
}
</style>
