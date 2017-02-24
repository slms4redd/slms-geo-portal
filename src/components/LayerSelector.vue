<template>
  <ul v-if="treeData" id="layer-selector">
    <item class="item" :conf="treeData"></tree>
  </ul>
</template>

<script>
import Item from './Item';
import { mapState } from 'vuex'

export default {
  name: 'layerSelector',
  components: {
    'item': Item
  },
  data() {
    return {
      treeData: null
    };
  },
  computed: mapState([
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
  background: rgb(0, 0, 0);
  background: rgba(0, 0, 0, 0.66);
  font-size: 14px;
  position: absolute;
  top: $banner-height + 8px;
  left: 8px;
  min-width: 50px;
  color: white;
  padding: 10px;
  /*max-height: 500px;*/
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
