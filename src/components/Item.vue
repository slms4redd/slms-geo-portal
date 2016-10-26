<template>
  <li>
    <div :class="{bold: isFolder}" @click="toggle" @dblclick="changeType">
      {{model.name}}
      <span v-if="isFolder">[{{open ? '-' : '+'}}]</span>
    </div>
    <ul v-show="open" v-if="isFolder">
      <item class="item" v-for="model in model.children" :model="model"></item>
    </ul>
  </li>
</template>

<script>
import bus from '../bus';

export default {
  name: 'item',
  props: {
    model: Object
  },
  data() {
    return { open: this.model.open }
  },
  computed: {
    isFolder() {
      return this.model.children && this.model.children.length;
    }
  },
  methods: {
    toggle() {
      if (this.isFolder) {
        this.open = !this.open;
      } else {
        // this.$emit('layerClick', event.target.value);
        bus.$emit('layer-toggled', this.model.id);
      }
    },
    changeType() { return null; }
  }
}
</script>

<style scoped>
.item {
  cursor: pointer;
}
.bold {
  font-weight: bold;
}
ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: dot;
}
</style>
