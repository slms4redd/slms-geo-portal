<template>
  <div class="vue-tree">
    <ul>
      <tree-item :node.sync="option.root"></tree-item>
    </ul>
  </div>
</template>

<script>
import TreeItem  from './treeItem'

export default {
  name: 'tree',
  props: {
    option: {
      type: Object
    }
  },
  components: {
    'tree-item': TreeItem
  }
}
</script>

<style scoped>

</style>
