<template>
  <li>
    <div v-if="conf.isGroup" :class="{dimmed: !nContexts}" class="group" @click="toggleGroup">
      <span class="line group-label icon">
        <icon class="open-button" v-bind:name="open ? 'minus-square-o' : 'plus-square-o'"></icon>
        <span :class="{handle: editing}">{{isRoot ? $t("layerSelector.layers") : label}}</span>
      </span>
      <span class="info-link icon" v-if="conf.infoFile" v-on:click.stop="showInfo">
        <icon name="info-circle"></icon>
      </span>
      <span class="counter">{{nActive ? '[' + nActive + ']' : null}}</span>
      <span v-if="editing && !isRoot" class="icon" v-on:click.stop="editItem">
        <icon name="pencil-square-o"></icon>
      </span>
      <span v-if="editing && !isRoot" class="icon" v-on:click.stop="deleteItem">
        <icon class="icon" name="trash-o"></icon>
      </span>
    </div>
    <div v-else>
      <span v-on:click="toggleActive" class="icon" v-if="hasLayers">
        <template v-if="conf.parent.exclusive">
          <icon v-if="active" class="activate-button" v-bind:class="{highlighted, active}" name="dot-circle-o"></icon>
          <icon v-else class="activate-button" v-bind:class="{highlighted, active}" name="circle"></icon>
        </template>
        <template v-else>
          <icon v-if="active" class="activate-button" v-bind:class="{highlighted, active}" name="check-square"></icon>
          <icon v-else class="activate-button" v-bind:class="{highlighted, active}" name="square"></icon>
        </template>
      </span>
      <span v-on:click="toggleLegend" style="padding-left:2px;padding-right:2px" class="icon" v-if="conf.hasLegends" >
        <icon class="legend-link" v-bind:class="{active}" name="th-list"></icon>
      </span>
      <img v-if="conf.inlineLegendUrl" class="inline-legend" v-bind:src="conf.inlineLegendUrl">
      <span :class="{dimmed: !hasLayers, handle: editing}" v-on:mouseover="highlightContext(true)" v-on:mouseout="highlightContext(false)" v-on:click="toggleActive">{{label}}</span>
      <span class="info-link icon" v-if="conf.infoFile" v-on:click="showInfo">
        <icon name="info-circle"></icon>
      </span>
      <span class="times-button icon" v-if="hasTimes" @click="toggleTimeMenu" v-bind:class="{active: showTimeMenu}">
        <icon name="clock-o"></icon> {{selectedTime.humanReadable}}
      </span>
      <span v-bind:title="$t('item.statisticsAvailable')" v-if="hasStatistics" class="icon statistics">
        <icon name="bar-chart"></icon>
      </span>
      <TimeSelect v-if="showTimeMenu" v-on:setTime="setTime" :times="conf.times" :selectedTime="selectedTime"></TimeSelect>
      <template v-if="conf.hasLegends && active && showLegend">
        <ContextLegend :conf="conf"></ContextLegend>
      </template>
      <span v-if="editing" class="icon" v-on:click.stop="editItem">
        <icon class="icon" name="pencil-square-o"></icon>
      </span>
      <span v-if="editing" class="icon" v-on:click.stop="deleteItem">
        <icon class="icon" name="trash-o"></icon>
      </span>
    </div>
    <template v-if="editing">
      <draggable element="ul" v-if="conf.isGroup" v-show="open" style="min-height:10px" :options="{ group: 'items', draggable: '.item', animation: 150, handle: '.handle' }" v-model='list'>
        <item class="item unselectable" v-for="conf in list" :key="conf.id" :conf="conf"></item>
      </draggable>
    </template>
    <template v-else>
      <ul v-if="conf.isGroup" v-show="open" style="min-height:10px">
        <item class="item unselectable" v-for="conf in list" :key="conf.id" :conf="conf"></item>
      </ul>
    </template>
  </li>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import ContextLegend from './ContextLegend';
import TimeSelect from './TimeSelect';
import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/plus-square-o';
import 'vue-awesome/icons/minus-square-o';
import 'vue-awesome/icons/th-list';
import 'vue-awesome/icons/info-circle';
import 'vue-awesome/icons/clock-o';
import 'vue-awesome/icons/bar-chart';
import 'vue-awesome/icons/square';
import 'vue-awesome/icons/check-square';
import 'vue-awesome/icons/circle';
import 'vue-awesome/icons/dot-circle-o';
import 'vue-awesome/icons/pencil-square-o';
import 'vue-awesome/icons/trash-o';

export default {
  name: 'item',
  components: {
    ContextLegend,
    TimeSelect,
    Icon
    // The draggable component is loaded dynamically
  },
  props: {
    conf: Object
  },
  data() {
    return {
      open: !this.conf.parent,
      showLegend: false,
      showTimeMenu: false,
      highlighted: false
    };
  },
  computed: {
    list: {
      get() {
        return this.conf.items;
      },
      set(value) {
        this.$store.commit('update_group', { groupId: this.conf.id, value: value });
      }
    },
    label() {
      const loc = this.conf.labels.find(l => l.language === Vue.config.lang);
      return loc ? loc.label : null;
    },
    isRoot() {
      return !this.conf.parent;
    },
    hasLayers() {
      return !!this.conf.layers.length;
    },
    hasTimes() {
      return !!this.conf.times.length;
    },
    hasStatistics() {
      return this.conf.layers && this.conf.layers.some(l => l.statistics);
    },
    selectedTime() {
      return this.contextsTimes[this.conf.id];
    },
    active() {
      return this.activeContextsIds.indexOf(this.conf.id) !== -1;
    },
    nContexts() {
      return (function count(conf) {
        if (conf.isGroup) {
          return conf.items.reduce((n, item) => n + count(item), 0);
        }
        return conf.layers.length ? 1 : 0;
      })(this.conf);
    },
    nActive() {
      const activeContextsIds = this.activeContextsIds;
      return (function count(conf) {
        if (conf.isGroup) {
          return conf.items.reduce((n, item) => n + count(item), 0);
        }
        return activeContextsIds.indexOf(conf.id) !== -1 ? 1 : 0;
      })(this.conf);
    },
    ...mapState([
      'contextsTimes',
      'activeContextsIds',
      'editing'
    ])
  },
  watch: {
    active() {
      this.showLegend = !this.active && false;
    }
  },
  methods: {
    startEditing() {
      // require.ensure('vuedraggable', () => {
      //   const vuedraggable = require('vuedraggable');
      //   Vue.component('draggable', vuedraggable);
      //   this.$store.commit('enable_edit', { editing: true });
      // });
      this.$store.commit('enable_edit', { editing: true });
    },
    editItem() {
      this.$store.commit('edit_item', { id: this.conf.id });
    },
    deleteItem() {
      if (confirm('Are you sure that you want to delete this item?')) {
        this.$store.commit('delete_item', { id: this.conf.id });
      }
    },
    highlightContext(highlight) {
      this.highlighted = highlight;
    },
    toggleGroup() {
      this.open = !this.open;
    },
    toggleActive() {
      if (this.conf.layers.length) {
        this.$store.commit('toggle_context', { contextId: this.conf.id });
        if (this.conf.parent.exclusive) {
          this.conf.parent.items.forEach(item => {
            if (item.id !== this.conf.id && this.activeContextsIds.indexOf(item.id) !== -1) {
              // it's not this context and it's active
              this.$store.commit('toggle_context', { contextId: item.id });
            }
          });
        }
      }
    },
    toggleLegend() {
      if (this.active) this.showLegend = !this.showLegend;
    },
    showInfo() {
      this.$store.commit('show_layer_info', { label: this.conf.label, fileName: this.conf.infoFile });
    },
    toggleTimeMenu() {
      this.showTimeMenu = !this.showTimeMenu;
    },
    setTime(time) {
      this.$store.commit('set_context_time', { contextId: this.conf.id, time: time });
    }
  }
};
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
  position: relative;
  top: 4px;
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
.counter {
  color: $highlight-color;
}

.icon svg.activate-button {
  top: 2px;
}
.icon svg {
  position: relative;
  top: 3px;
}
.icon.statistics svg {
  color: #999;
}
.handle {
  cursor: move;
}
</style>
