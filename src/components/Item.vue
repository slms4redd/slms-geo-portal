<template>
  <li>
    <div v-if="isGroup" class="bold" @click="toggleGroup">
      {{isRoot ? 'Layers' : model.label}}
      [<span class="toggle">{{open ? '-' : '+'}}</span>]
    </div>
    <div v-else>
      <input v-if="hasLayers" type="checkbox" v-model="active">
      <img v-show="model.hasLegends && !active" class="inline-legend" src="../assets/legend-off.png">
      <img v-show="model.hasLegends && active" v-on:click="showLegend" class="inline-legend" src="../assets/legend-on.png">
      <label v-on:click="toggleLayer" :class="{dimmed: !hasLayers}">
        <img v-if="model.inlineLegendUrl" class="inline-legend" v-bind:src="model.inlineLegendUrl">
        {{isRoot ? 'Layers' : model.label}}
      </label>
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
    toggleGroup() {
      this.open = !this.open;
    },
    toggleLayer() {
      this.active = !this.active;
    },
    showLegend() {
      console.log('Not implemented yet');
    }
  },
  watch: {
    active(value) {
      this.model.layers.forEach(layer => bus.$emit('layer-toggled', layer.id, this.active));
    }
  }
}
</script>

<style scoped>
.item {
  cursor: default;
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
.inline-legend {
  width: 20px;
  height: 20px;
  vertical-align: middle;
}
</style>
