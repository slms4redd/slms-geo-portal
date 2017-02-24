<template>
  <li>
    <div v-if="isGroup" class="group" @click="toggleGroup">
      <span class="line group-label">
        <icon class="open-button" v-bind:name="open ? 'octicon-diff-removed' : 'octicon-diff-added'"></icon>
        {{isRoot ? $t("layerSelector.layers") : conf.label}}
      </span>
      <span class="info-link" v-if="conf.infoFile" v-on:click.stop="showInfo"><icon name="octicon-info"></icon></span>
    </div>
    <div v-else>
      <span v-on:click="toggleActive"><icon class="activate-button" v-bind:class="{highlighted, active}" name="octicon-check" v-if="hasLayers"></icon></span>
      <span v-on:click="toggleLegend"><icon class="legend-link" v-bind:class="{active}" v-show="conf.hasLegends" name="octicon-list-unordered"></icon></span>
      <img v-if="conf.inlineLegendUrl" class="inline-legend" v-bind:src="conf.inlineLegendUrl">
      <span :class="{dimmed: !hasLayers}" v-on:mouseover="highlightContext(true)" v-on:mouseout="highlightContext(false)" v-on:click="toggleActive">{{conf.label}}</span>
      <span class="info-link" v-if="conf.infoFile" v-on:click="showInfo"><icon name="octicon-info"></icon></span>
      <span class="times-button" v-if="hasTimes" @click="toggleTimeMenu" v-bind:class="{active: showTimeMenu}"><icon class="icon" v-if="hasTimes" name="octicon-clock"> {{selectedTime.humanReadable}}</span>
      <TimeSelect v-if="showTimeMenu" v-on:setTime="setTime" :times="conf.times" :selectedTime="selectedTime"></TimeSelect>
      <template v-if="conf.hasLegends && active && showLegend">
        <ContextLegend :conf="conf"></ContextLegend>
      </template>
    </div>
    <ul v-show="open" v-if="isGroup">
      <item class="item" v-for="conf in conf.items" :conf="conf"></item>
    </ul>
  </li>
</template>

<script>
import { mapState } from 'vuex'
import ContextLegend from './ContextLegend';
import TimeSelect from './TimeSelect';

export default {
  name: 'item',
  components: {
    ContextLegend,
    TimeSelect,
    "icon": require("vue-icons/icon")
  },
  props: {
    conf: Object
  },
  data() {
    return {
      open: !this.conf.label,
      // active: this.conf.active,
      showLegend: false,
      showTimeMenu: false,
      highlighted: false
    }
  },
  computed: {
    isContext() {
      return !this.conf.items;
    },
    isGroup() {
      return !this.isContext;
    },
    isRoot() {
      return !this.conf.label;
    },
    hasLayers() {
      return !!this.conf.layers.length;
    },
    hasTimes() {
      return !!this.conf.times.length
    },
    selectedTime() {
      return this.contextsTimes[this.conf.id]
    },
    active() {
      return this.activeContextsIds.indexOf(this.conf.id) !== -1
    },
    ...mapState([
      'contextsTimes',
      'activeContextsIds'
    ])
  },
  watch: {
    active() {
      this.showLegend = !this.active && false;
    }
  },
  methods: {
    highlightContext(highlight) {
      this.highlighted = highlight;
    },
    toggleGroup() {
      this.open = !this.open;
    },
    toggleActive() {
      this.$store.commit('toggle_context', { contextId: this.conf.id });
      if (this.conf.group.exclusive) {
        this.conf.group.items.forEach(item => {
          if (item.id != this.conf.id && this.activeContextsIds.indexOf(item.id) !== -1) {
            // it's not this context and it's active
            this.$store.commit('toggle_context', { contextId: item.id });
          }
        });
      }
    },
    toggleLegend() {
      if (this.active) {
        this.showLegend = !this.showLegend;
      }
    },
    showInfo() {
      this.$store.dispatch('showLayerInfo',  { label: this.conf.label, fileName: this.conf.infoFile });
    },
    toggleTimeMenu() {
      this.showTimeMenu = !this.showTimeMenu;
    },
    setTime(time) {
      this.$store.commit('set_context_time', { contextId: this.conf.id, time: time })
    }
  },
}
</script>

<style lang="scss" scoped>
@import "../assets/global.scss";

.line {
  white-space: nowrap;
}
.item {
  cursor: default;
}
.group {
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
.info-link:hover, .times-button:hover {
  color: $highlight-color;
}
.legend-link {
  color: #666;
}
.legend-link.active {
  color: #fff;
}
.legend-link.active:hover {
  color: $highlight-color;
}
.open-button {
  position: relative;
  top: 3px;
  color: #fff;
}
.group-label:hover .open-button {
  color: $highlight-color;
}
.activate-button {
  color: #666;
}
.activate-button.active {
  color: #fff;
}
.activate-button.highlighted {
  color: $highlight-color;
}
.activate-button:hover {
  color: $highlight-color;
}
</style>
<style>
.info-link svg, .legend-link svg, .times-button svg {
  position: relative;
  top: 3px;
}
</style>
