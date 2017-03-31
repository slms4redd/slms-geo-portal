<template>
  <div id="editor-console">
    <template v-if="editing">
      <button type="button" class="small" @click="addGroup">Add Group</button>
      <button type="button" class="small" @click="addContext">Add Context</button>
      <button type="button" class="small" @click="editLayers">Layers</button>
      <br><br>
      <button type="button" class="small" @click="cancel">Cancel</button>
      <button type="button" class="danger small" @click="save">Save</button>
    </template>
    <template v-else>
      <button type="button" class="small" @click="startEditing">Edit</button>
      <button type="button" class="small" @click="showHistory">Versions</button>
      <!-- <button type="button" class="small" @click="copyToClipboard">Copy</button> -->
    </template>
    <edit-group></edit-group>
    <edit-contexts></edit-contexts>
    <edit-layers></edit-layers>
    <restore-backup v-on:close="hideHistory" :backups="backups" v-if="backups"></restore-backup>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { saveConfiguration, getConfigurationHistory } from '../../config';
import EditGroup from './EditGroup';
import EditContext from './EditContext';
import EditLayers from './EditLayers';
import RestoreBackup from './RestoreBackup';

export default {
  data() {
    return {
      backups: null
    };
  },
  components: {
    'edit-group': EditGroup,
    'edit-contexts': EditContext,
    'edit-layers': EditLayers,
    'restore-backup': RestoreBackup
  },
  methods: {
    startEditing() {
      // the 'editing' flag is also used in Item.vue
      this.$store.dispatch('enableEdit', { enable: true });
    },
    showHistory() {
      getConfigurationHistory().then(backups => { this.backups = backups });
    },
    hideHistory() {
      this.backups = null;
    },
    // copyToClipboard() {
    //   alert('Not implemented yet');
    // },
    editLayers() {
      this.$store.commit('edit_layers', { edit: true });
    },
    cancel() {
      this.$store.commit('enable_edit', { enable: false });

      // Reload the layers configuration from server
      this.$store.dispatch('fetchLayersConfig');
    },
    addGroup() {
      this.$store.commit('add_group');
    },
    addContext() {
      this.$store.commit('add_context');
    },
    save() {
      // const conf = {
      //   layers: this.layers,
      //   contexts: this.contexts,
      //   groups: this.groups
      // };

      saveConfiguration(this.groups)
        .then(() => {
          alert('Configuration saved');
          this.$store.dispatch('enableEdit', { enable: false });
        });
        // .catch(e => alert(e.statusText));
    }
  },
  computed: mapState([
    'editing',

    'layers',
    'contexts',
    'groups'
  ])
};
</script>

<style scoped>
#editor-console {
  clear: left;
  position:relative;
  top: 8px;
}
</style>
