<template>
  <ul v-if="groups" id="layer-selector">
    <item class="item" :conf="groups"></item>
  </ul>
</template>

<script>
import Item from './Item'
import { mapState } from 'vuex'
import auth from '../auth'

export default {
  name: 'layerSelector',
  components: {
    Item
  },
  data() {
    return {
      user: auth.user
    }
  },

  computed: mapState([
    'groups'
  ])
}
</script>

<style scoped>
#layer-selector {
  background: rgb(0, 0, 0);
  background: rgba(0, 0, 0, 0.66);
  font-size: 14px;
  float: left;
  min-width: 50px;
  min-height: 45px;
  color: white;
  overflow: auto;
  border-radius: 5px;
  backdrop-filter: blur(5px);
  margin: 0;
  position: relative;
  max-height: 100%;
  pointer-events: auto;
  overflow: auto;
}
ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: none;
}
.item {
  position: relative;
  padding: 10px;
  padding-left: 0;
  margin-right: 10px;
}
</style>
