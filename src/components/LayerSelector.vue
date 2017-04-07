<template>
  <ul v-if="groups" id="layer-selector">
    <item class="item" :conf="groups"></item>
<!--     <template v-if="user.authenticated">
      <template v-if="editing">
        <li>
          <button type="button" class="small" @click="addGroup">Add Group</button>
          <button type="button" class="small" @click="addContext">Add Context</button>
          <button type="button" class="small" @click="editLayers">Layers</button>
        </li>
        <li>
          <button type="button" class="small" @click="cancel">Cancel</button>
          <button type="button" class="danger small" @click="save">Save</button>
        </li>
      </template>
      <li v-else>
        <button type="button" class="small" @click="startEditing">Edit</button>
        <button type="button" class="small" @click="showHistory">History</button>
        <button type="button" class="small" @click="copyToClipboard">Copy</button>
      </li>
    </template>
 -->  
  </ul>
</template>

<script>
import Item from './Item';
// import EditorConsole from './edit/EditorConsole';
import { mapState } from 'vuex';
// import { saveConfiguration, getConfigurationHistory } from '../config';
import auth from '../auth';

export default {
  name: 'layerSelector',
  components: {
    'item': Item
    // 'editor-console': EditorConsole
  },
  data() {
    return {
      user: auth.user
    };
  },
  // methods: {
  //   startEditing() {
  //     this.$store.dispatch('enableEdit', { enable: true });
  //   },
  //   showHistory() {
  //     getConfigurationHistory().then(history => alert(history.length)); // TODO
  //   },
  //   copyToClipboard() {
  //     alert('Not implemented yet');
  //   },
  //   editLayers() {
  //     this.$store.commit('edit_layers', { edit: true });
  //   },
  //   cancel() {
  //     this.$store.commit('enable_edit', { enable: false });
  //   },
  //   addGroup() {
  //     this.$store.commit('add_group');
  //   },
  //   addContext() {
  //     this.$store.commit('add_context');
  //   },
  //   save() {
  //     const conf = {
  //       layers: this.layers,
  //       contexts: this.contexts,
  //       groups: this.groups
  //     };

  //     saveConfiguration(conf)
  //       .then(() => alert('Configuration saved'))
  //       .catch(e => alert(e.statusText));
  //   }
  // },
  computed: mapState([
    // used together with groups to serialize the configuration
    // 'layers',
    // 'contexts',

    'groups'
    // 'editing'
  ])
};
</script>

<style scoped>
#layer-selector {
  background: rgb(0, 0, 0);
  background: rgba(0, 0, 0, 0.66);
  font-size: 14px;
  /* position: absolute;
  top: $banner-height + 8px;
  left: 8px;*/
  float: left;
  min-width: 50px;
  color: white;
  padding: 10px;
  overflow: auto;
  border-radius: 5px;
  backdrop-filter: blur(5px);
  margin: 0;
}
ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: none;
}
</style>
