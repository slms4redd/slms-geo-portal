<template>
  <li>
    <div
      :class="{bold: isFolder}"
      @click="toggle"
      @dblclick="changeType">
      {{model.name}}
      <span v-if="isFolder">[{{open ? '-' : '+'}}]</span>
    </div>
    <ul v-show="open" v-if="isFolder">
      <item
        class="item"
        v-for="model in model.children"
        :model="model">
      </item>
    </ul>
  </li>
</template>

<script>
export default {
  name: 'item',
  props: {
    model: Object
  },
  data() {
    return { open: false }
  },
  computed: {
    isFolder() {
      return this.model.children && this.model.children.length
    }
  },
  methods: {
    toggle() {
      if (this.isFolder) {
        this.open = !this.open
      }
    },
    changeType() {
      if (!this.isFolder) {
        Vue.set(this.model, 'children', [])
        this.addChild()
        this.open = true
      }
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
ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: dot;
}
</style>
