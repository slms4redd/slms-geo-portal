<template>
  <li>
    <div v-if="isGroup" class="bold" @click="toggleGroup">
      {{isRoot ? $t("layerSelector.layers") : model.label}}
      [<span class="toggle">{{open ? '-' : '+'}}</span>]
      <span class="info-link" v-if="model.infoFile" v-on:click.stop="showInfo">i</span>
    </div>
    <div v-else>
      <input v-bind:id="_uid" v-if="hasLayers" type="checkbox" v-model="active">
      <img v-show="model.hasLegends && !active" class="inline-legend" src="../assets/legend-off.png">
      <img v-show="model.hasLegends && active" v-on:click="toggleLegend" class="inline-legend" src="../assets/legend-on.png">
      <label v-bind:for="_uid" :class="{dimmed: !hasLayers}">
        <img v-if="model.inlineLegendUrl" class="inline-legend" v-bind:src="model.inlineLegendUrl">
        {{isRoot ? $t("layerSelector.layers") : model.label}}
      </label>
      <span class="info-link" v-if="model.infoFile" v-on:click="showInfo">i</span>
      <template v-if="model.hasLegends && active && showLegend">
        <ContextLegend :model="model"></ContextLegend>
      </template>
    </div>
    <ul v-show="open" v-if="isGroup">
      <item class="item" v-for="model in model.items" :model="model"></item>
    </ul>
  </li>
</template>

<script>
import ContextLegend from './ContextLegend';

export default {
  name: 'item',
  components: {
    ContextLegend
  },
  props: {
    model: Object
  },
  data() {
    return {
      open: !this.model.label,
      active: this.model.active,
      showLegend: false
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
    toggleLegend() {
      this.showLegend = !this.showLegend;
    },
    showInfo() {
      this.$store.dispatch('showLayerInfo',  { label: this.model.label, fileName: this.model.infoFile });
    }
  },
  watch: {
    active() {
      this.$store.commit('toggle_context', { contextId: this.model.id, active: this.active });
      // Turn off legend when hiding the context
      this.showLegend = !this.active && false;
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
.info-link {
  display: inline-block;
  height: 16px;
  width: 16px;
  line-height: 16px;

  -moz-border-radius: 10px;
  border-radius: 10px;

  background-color: transparent;
  color: #ffa500;
  text-align: center;

  font-style: italic;
  font-weight: bold;
  font-family: Georgia, Times, "Times New Roman", serif;
  transition: all 100ms linear;
}
.info-link:hover {
  background-color: #ffa500;
  color: black;
  -webkit-transition-property: none;
  -moz-transition-property: none;
  -o-transition-property: none;
  transition-property: none
}
</style>
