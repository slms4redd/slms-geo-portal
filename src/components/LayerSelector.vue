<template>
  <ul v-if="groups" id="layer-selector">
    <item class="item" :conf="groups"></item>
    <template v-if="user.authenticated">
      <li v-if="editing">
        <button type="button" class="small" @click="addGroup">Add Group</button>
        <button type="button" class="small" @click="addContext">Add Context</button>
        <button type="button" class="small" @click="editLayers">Layers</button>
      </li>
      <li v-if="editing">
        <button type="button" class="small danger" @click="save">Save</button>
        <button type="button" class="small" @click="cancel">Cancel</button>
      </li>
      <li v-else>
        <button type="button" class="small" @click="startEditing">Edit</button>
      </li>
    </template>
  </ul>
</template>

<script>
import Item from './Item';
import EditGroup from './edit/EditGroup';
import { mapState } from 'vuex';
import auth from '../auth';

export default {
  name: 'layerSelector',
  components: {
    'item': Item,
    'editGroup': EditGroup
  },
  data() {
    return {
      user: auth.user
    };
  },
  methods: {
    startEditing() {
      this.$store.dispatch('enableEdit', { enable: true });
    },
    editLayers() {
      this.$store.commit('edit_layers', { edit: true });
    },
    cancel() {
      this.$store.commit('enable_edit', { enable: false });
    },
    addGroup() {
      this.$store.commit('add_group');
    },
    addContext() {
      this.$store.commit('add_context');
    },
    save() {
      alert('Not implemented yet');
    }
  },
  computed: mapState([
    'groups',
    'editing'
  ])
};
</script>

<style lang="scss" scoped>
@import "../assets/global.scss";

#layer-selector {
  background: rgb(0, 0, 0);
  background: rgba(0, 0, 0, 0.66);
  font-size: 14px;
  position: absolute;
  top: $banner-height + 8px;
  left: 8px;
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
