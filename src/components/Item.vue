<template>
  <li>
    <div v-if="isGroup" class="bold" @click="toggleGroup">
      {{isRoot ? $t("layerSelector.layers") : model.label}}
      [<span class="toggle">{{open ? '-' : '+'}}</span>]
      <span class="info-link" v-if="model.infoFile" v-on:click.stop="showInfo"><icon name="glyphicon-info-sign"></icon></span>
    </div>
    <div v-else>
      <input v-bind:id="_uid" v-if="hasLayers" type="checkbox" v-model="active">
      <!--img v-show="model.hasLegends && !active" v-on:click="toggleLegend" class="inline-legend" src="../assets/legend-off.png"-->
      <!--img v-show="model.hasLegends && active" v-on:click="toggleLegend" class="inline-legend" src="../assets/legend-on.png"-->
      <!--icon name="octicon-list-unordered"></icon-->
      <span v-on:click="toggleLegend"><icon class="legend-link" v-bind:class="{ active }" v-show="model.hasLegends" name="glyphicon-list"></icon></span>

      <label v-bind:for="_uid" :class="{dimmed: !hasLayers}">
        <img v-if="model.inlineLegendUrl" class="inline-legend" v-bind:src="model.inlineLegendUrl">
        {{isRoot ? $t("layerSelector.layers") : model.label}}
      </label>
      <span class="info-link" v-if="model.infoFile" v-on:click="showInfo"><icon name="glyphicon-info-sign"></icon></span>
      <span class="times-button" v-if="hasTimes" @click="toggleTimeMenu" v-bind:class="{active: showTimeMenu}"><icon class="icon" v-if="hasTimes" name="glyphicon-time"> {{selectedTime.humanReadable}}</span>
      <TimeSelect v-if="showTimeMenu" v-on:setTime="setTime" :times="model.times" :selectedTime="selectedTime"></TimeSelect>
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
import { mapGetters } from 'vuex'
import ContextLegend from './ContextLegend';
import TimeSelect from './TimeSelect';

export default {
  name: 'item',
  components: {
    ContextLegend,
    TimeSelect,
    "icon": require("vue-icons")
  },
  props: {
    model: Object
  },
  data() {
    return {
      open: !this.model.label,
      active: this.model.active,
      showLegend: false,
      showTimeMenu: false
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
    },
    hasTimes() {
      return !!this.model.times.length
    },
    selectedTime() {
      return this.contextsTimes[this.model.id]
    },
    ...mapGetters([
      'contextsTimes'
    ])
  },
  methods: {
    toggleGroup() {
      this.open = !this.open;
    },
    toggleLegend() {
      if (this.active) {
        this.showLegend = !this.showLegend;
      }
    },
    showInfo() {
      this.$store.dispatch('showLayerInfo',  { label: this.model.label, fileName: this.model.infoFile });
    },
    toggleTimeMenu() {
      console.log(this.showTimeMenu)
      this.showTimeMenu = !this.showTimeMenu;
    },
    setTime(time) {
      this.$store.commit('set_context_time', { contextId: this.model.id, time: time })
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
.info-link:hover, .times-button:hover, .times-button.active {
  color: #ffa500;
}
.legend-link {
  color: #888;
}
.legend-link.active {
  color: #fff;
}
.legend-link.active:hover {
  color: #ffa500;
}
</style>
<style>
.info-link svg, .legend-link svg, .times-button svg {
  position: relative;
  top: 5px;
}
</style>