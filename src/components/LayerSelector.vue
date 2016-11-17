<template>
  <ul v-if="treeData" id="layer-selector">
    <item class="item" :model="treeData"></tree>
  </ul>
</template>

<script>
import Item from './Item';
import { mapGetters } from 'vuex'

export default {
  name: 'layerSelector',
  components: {
    'item': Item
  },
  data() {
    return { treeData: null };
  },
  computed: mapGetters([
    'groups'
  ]),
  watch: {
    groups: function(groups) {
      this.treeData = groups;
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/global.scss";

#layer-selector {
  @extend %opacity;

  font-size: 14px;
  position: absolute;
  top: $banner-height + 56px;
  left: 8px;
  min-width: 50px;
  background-color: black;
  color: white;
  padding: 10px;
  /*max-height: 500px;*/
  overflow: auto;
  border-radius: 5px;
}
ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: none;
}
</style>
