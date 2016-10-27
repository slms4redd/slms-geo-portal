<template>
  <li>
    <div v-if="isGroup" class="bold" @click="toggle">
      {{isRoot ? 'Layers' : model.label}}
      [<span class="toggle">{{open ? '-' : '+'}}</span>]
    </div>
    <div v-else>
      <label :class="{dimmed: !hasLayers}"><input v-if="hasLayers" type="checkbox" v-model="active"> {{isRoot ? 'Layers' : model.label}}</label>
    </div>
    <ul v-show="open" v-if="isGroup">
      <item class="item" v-for="model in model.items" :model="model"></item>
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
    return {
      open: !this.model.label,
      active: this.model.active
    }
  },
  computed: {
    isContext() {
      return !this.model.items;
    },
    isGroup() {
      return !this.isContext;
    },
    isRoot() {
      return !this.model.label;
    },
    hasLayers() {
      return !!this.model.layers.length;
    }
  },
  methods: {
    toggle() {
      this.open = !this.open;
    }
  },
  watch: {
    active() {
      this.model.layers.forEach(layer => bus.$emit('layer-toggled', layer.id, this.active));
    }
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
.dimmed {
  color: #aaa;
  font-style: italic;
}
ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: none;
}
.toggle {
  font-family: "Courier New", Courier, monospace;
}
</style>
