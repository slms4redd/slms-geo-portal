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
          children: treeItem.items && treeItem.items.map(subItem => buildTree(subItem))
        };
      })(config.groups)
    }
  }
}
</script>

<style scoped>
#layer-selector {
  /* Opacity */
  -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=50)";
  filter: alpha(opacity=80);
  -moz-opacity: 0.80;
  -khtml-opacity: 0.8;
  opacity: 0.8;

  position: absolute;
  top: 215px;
  width: 380px;
  background-color: black;
  color: white;
  padding: 20px;
}
</style>
