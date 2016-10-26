<template>
  <ul id="layer-selector">
    <item class="item" :model="treeData"></tree>
  </ul>
</template>

<script>
import { config } from '../config'
import Item from './Item'

export default {
  name: 'layerSelector',
  components: {
    'item': Item
  },
  data() {
    return {
      treeData: (function buildTree(treeItem) {
        return {
          name: treeItem.label || 'Layers',
          open: !treeItem.label,
          children: treeItem.items && treeItem.items.map(subItem => buildTree(subItem)),
          id: treeItem.id || null
        };
      })(config.groups)
    }
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
  max-height: 300px;
  overflow: auto;
  
  -webkit-transition: max-width 2s; /* Safari */
  transition: max-width 2s;
}
</style>
