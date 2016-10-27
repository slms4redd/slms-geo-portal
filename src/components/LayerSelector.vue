<template>
  <ul id="layer-selector">
    <item class="item" :model="treeData"></tree>
  </ul>
</template>

<script>
import { config } from '../config';
import Item from './Item';

export default {
  name: 'layerSelector',
  components: {
    'item': Item
  },
  data() {
    return { treeData: config.groups };

    // return {
    //   treeData: (function buildTree(treeItem) {
    //     return {
    //       id: treeItem.id || null,
    //       name: treeItem.label || 'Layers',
    //       open: !treeItem.label,
    //       children: treeItem.items && treeItem.items.map(subItem => buildTree(subItem))
    //     };
    //   })(config.groups)
    // }
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/global.scss";

#layer-selector {
  @extend %opacity;

  position: absolute;
  top: 160px;
  min-width: 50px;
  background-color: black;
  color: white;
  padding: 20px;
  max-height: 500px;
  overflow: auto;
}
ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: none;
}
</style>
