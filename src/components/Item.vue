<template>
  <li>
    <div v-if="conf.isGroup" :class="{dimmed: !nContexts}" class="group" @click="toggleContent">
      <!-- This item is a group -->
      <!-- Open/close group button -->
      <span class="line icon">
        <icon class="open-button" :name="open ? 'minus-square-o' : 'plus-square-o'"></icon>
        <span :class="{handle: editing}">{{isRoot ? $t("layerSelector.layers") : label}}</span>
      </span>

      <!-- Group info button -->
      <span class="info-link icon" v-if="conf.infoFile" @click.stop="showInfo">
        <icon name="info-circle"></icon>
      </span>
      
      <span class="counter">{{nActive ? '&lrm;[' + locNActive + '&lrm;]' : null}}</span>

      <!-- Edit and delete group button -->
      <template v-if="editing && !isRoot">
        <span class="icon" @click.stop="editItem">
          <icon class="icon edit" name="pencil-square-o"></icon>
        </span>
        <span class="icon" @click.stop="deleteItem">
          <icon class="icon edit" name="trash-o"></icon>
        </span>
      </template>
    </div>

    <div v-else>
      <!-- This item is a context -->
      <!-- Toggle context button -->
      <span class="icon" @click="toggleContent" v-if="hasLayers">
        <icon v-if="open" class="open-button" name="caret-down"/>
        <icon v-else class="open-button" name="caret-right"/>
      </span>

      <!-- Layer toggle button -->
      <span @click="toggleActive" class="icon" v-if="hasLayers">
        <template v-if="conf.parent.exclusive">
          <icon v-if="active" class="activate-button" :class="{highlighted, active}" name="dot-circle-o"></icon>
          <icon v-else class="activate-button" :class="{highlighted, active}" name="circle"></icon>
        </template>
        <template v-else>
          <icon v-if="active" class="activate-button" :class="{highlighted, active}" name="check-square"></icon>
          <icon v-else class="activate-button" :class="{highlighted, active}" name="square"></icon>
        </template>
      </span>

      <!-- Legend toggle button -->
      <span @click="toggleLegend" style="padding-left:2px;padding-right:2px" class="icon" v-if="conf.hasLegends" >
        <icon class="legend-link" :class="{active}" name="th-list"></icon>
      </span>

      <img v-if="conf.inlineLegendUrl" class="inline-legend" :src="conf.inlineLegendUrl">

      <span :class="{dimmed: !hasLayers, handle: editing}" @mouseover="highlightContext(true)" @mouseout="highlightContext(false)" @click="toggleActive">{{label}}</span>

      <!-- Context info button -->
      <span class="info-link icon" v-if="conf.infoFile" @click="showInfo">
        <icon name="info-circle"></icon>
      </span>


      <span class="times-button icon" v-if="this.conf.times && !!this.conf.times.length" @click="toggleTimeMenu" :class="{active: showTimeMenu}">
        <icon name="clock-o"></icon> {{selectedTime.humanReadable}}
      </span>

      <!-- Statistics button -->
      <span :title="$t('item.statisticsAvailable')" v-if="hasStatistics" class="icon statistics">
        <icon name="bar-chart"></icon>
      </span>

      <!-- Data download button -->
      <span :title="$t('item.downloadAvailable')" v-if="hasDataDownload" class="icon datadownload info-link" @click="showDownloads">
        <icon name="download"></icon>
      </span>

      <!-- Time select menu -->
      <time-select v-if="showTimeMenu" @setTime="setTime" :times="conf.times" :selectedTime="selectedTime"></time-select>

      <!-- Edit and delete context button -->
      <template v-if="editing">
        <span class="icon" @click.stop="editItem">
          <icon class="icon edit" name="pencil-square-o"></icon>
        </span>
        <span class="icon" @click.stop="deleteItem">
          <icon class="icon edit" name="trash-o"></icon>
        </span>
      </template>

      <!-- Opacity slider -->
      <div v-if="open" style="padding-left:21px">
        <icon name="adjust"></icon>
        <input v-model="opacity" class="slider" type="range" min="0" max="1" step="0.01" @input="updateOpacity">
      </div>

      <!-- Context legend -->
      <template v-if="conf.hasLegends && active && showLegend">
        <context-legend :conf="conf"></context-legend>
      </template>

    </div>

    <!-- Inner items (context and groups) -->
    <template v-if="editing">
      <draggable element="ul"
                 v-if="conf.isGroup"
                 v-show="open"
                 style="min-height:10px"
                 :options="{ group: 'items', draggable: '.item', animation: 150, handle: '.handle' }"
                 v-model='list'>
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
import Vue from 'vue'
import { mapState } from 'vuex'
import ContextLegend from './ContextLegend'
import TimeSelect from './TimeSelect'
import Icon from 'vue-awesome/components/Icon'
import { languages } from 'config'

import 'vue-awesome/icons/plus-square-o'
import 'vue-awesome/icons/minus-square-o'
import 'vue-awesome/icons/th-list'
import 'vue-awesome/icons/info-circle'
import 'vue-awesome/icons/clock-o'
import 'vue-awesome/icons/bar-chart'
import 'vue-awesome/icons/square'
import 'vue-awesome/icons/check-square'
import 'vue-awesome/icons/circle'
import 'vue-awesome/icons/dot-circle-o'
import 'vue-awesome/icons/pencil-square-o'
import 'vue-awesome/icons/trash-o'
import 'vue-awesome/icons/download'
import 'vue-awesome/icons/caret-right'
import 'vue-awesome/icons/caret-down'
import 'vue-awesome/icons/adjust'

const processTemplate = function(template, feature) {
  const regex = /\$\((\w+)\)/g
  return template.replace(regex, (match, p) => {
    const attributeName = match.substring(2, match.length - 1)
    return feature.getProperties()[attributeName]
  })
}

export default {
  name: 'item',

  components: {
    ContextLegend,
    TimeSelect,
    Icon,
    // load vuedraggable dynamically as it's only needed for editing
    'draggable': resolve => require.ensure(['vuedraggable'], require => resolve(require('vuedraggable')), 'editing-chunk')
  },

  props: {
    conf: Object
  },

  data() {
    return {
      open: !this.conf.parent,
      showLegend: false,
      showTimeMenu: false,
      highlighted: false,
      opacity: this.conf.opacity
    }
  },

  computed: {
    list: {
      get() {
        return this.conf.items
      },

      set(value) {
        this.$store.commit('update_group', { groupId: this.conf.id, value })
      }
    },

    label() {
      const loc = this.conf.labels.find(l => l.language === Vue.i18n.locale())
      return loc ? loc.label : null
    },

    isRoot() { return !this.conf.parent },

    hasLayers() { return !!this.conf.layers && !!this.conf.layers.length },

    hasStatistics() { return !!this.conf.layers && this.conf.layers.some(l => l.statistics) },

    hasDataDownload() { return !!this.conf.layers && this.conf.layers.some(l => l.downloadLinks) },

    selectedTime() { return this.contextsTimes[this.conf.id] },

    active() { return this.activeContextsIds.indexOf(this.conf.id) !== -1 },

    nContexts() {
      return (function count(conf) {
        if (conf.isGroup) {
          return conf.items.reduce((n, item) => n + count(item), 0)
        }
        return conf.layers.length ? 1 : 0
      })(this.conf)
    },

    nActive() {
      const activeContextsIds = this.activeContextsIds
      return (function count(conf) {
        if (conf.isGroup) {
          return conf.items.reduce((n, item) => n + count(item), 0)
        }
        return activeContextsIds.indexOf(conf.id) !== -1 ? 1 : 0
      })(this.conf)
    },

    locNActive() {
      let locale = Vue.i18n.locale()
      const lang = languages.find(l => l.id === locale)
      if (lang && lang.u) locale += `-u-${lang.u}`

      if (typeof Intl === 'object' && typeof Intl.NumberFormat === 'function') {
        return this.nActive.toLocaleString(locale)
      } else {
        return this.nActive
      }
    },

    ...mapState([
      'contextsTimes',
      'activeContextsIds',
      'editing'
    ])
  },

  watch: {
    active() { this.showLegend = false }
  },

  methods: {
    startEditing() { this.$store.commit('enable_edit', { editing: true }) },

    editItem() { this.$store.commit('edit_item', { id: this.conf.id }) },

    deleteItem() {
      if (confirm('Are you sure that you want to delete this item?')) {
        this.$store.commit('delete_item', { id: this.conf.id })
      }
    },

    highlightContext(highlight) { this.highlighted = highlight },

    toggleContent() { this.open = !this.open },

    toggleActive() {
      if (this.conf.layers.length) {
        if (!this.conf.parent.exclusive) {
          this.$store.commit('toggle_context', { contextId: this.conf.id })
        } else {
          if (this.conf.parent.allowDisableAll || !this.active) this.$store.commit('toggle_context', { contextId: this.conf.id })
          this.conf.parent.items.forEach(item => {
            if (item.id !== this.conf.id && this.activeContextsIds.indexOf(item.id) !== -1) {
              // it's not this context and it's active
              this.$store.commit('toggle_context', { contextId: item.id })
            }
          })
        }
      }
    },

    updateOpacity(event) {
      if (this.conf.layers.length) {
        this.$store.commit('update_context', {
          contextId: this.conf.id,
          property: 'opacity',
          value: +event.target.value
        })
      }
    },

    toggleLegend() { if (this.active) this.showLegend = !this.showLegend },

    showInfo() { this.$store.commit('show_layer_info', { label: this.conf.label, fileName: this.conf.infoFile }) },

    showDownloads() {
      let downloadLinksHTML = `<div style="padding: 20px;"><div><b>${this.label} Downloads</b></div><br/><table>`
      !!this.conf.layers &&
        this.conf.layers
        .forEach(
          l => l.downloadLinks.forEach(
            (d, downloadIndex) => {
              const template = d.labels.find(l => l.language === Vue.i18n.locale()).label
              downloadLinksHTML += '<tr><td><a href="' +
               d.url + '" target=_blank>' +
               (template
                ? processTemplate(template, l)
                : (l.name || 'Unnamed Layer') + ' Download #' + (downloadIndex + 1)) + '</a></td></tr>'
            }
          )
        )
      downloadLinksHTML += '</table></div>'
      this.$store.commit('show_layer_info', { label: 'Downloads', custom_content: downloadLinksHTML })
    },

    toggleTimeMenu() { this.showTimeMenu = !this.showTimeMenu },

    setTime(time) { this.$store.commit('set_context_time', { contextId: this.conf.id, time }) }
  }
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
  position: relative;
  top: 4px;
}

.info-link:hover, .times-button:hover {
  color: $highlight-color;
}

.legend-link {
  color: #666;

  &.active {
    color: #fff;

    &:hover {
      color: $highlight-color;
    }
  }
}

.open-button {
  color: #fff;
}

.icon:hover .open-button {
  color: $highlight-color;
}

.counter {
  color: $highlight-color;
}

.icon {
  .activate-button {
    // top: 2px;
    color: #666;

    &.active {
      color: #fff;
    }

    &.highlighted {
      color: $highlight-color;
    }
    
    &:hover {
      color: $highlight-color;
    }
  }

  svg {
    width: 16px;
    position: relative;
    top: 3px;
  }

  &.edit {
    color: #ffd600;
  }

 
  &.statistics {
    color: #999;
  }
}

.handle {
  cursor: move;
}

.slider {
  width: 80px;
}
</style>
