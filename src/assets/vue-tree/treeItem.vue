<template>
  <li :class="{parent_li: node.isParent}">
    <i v-if="node.isParent" v-on:click="toggle(node)" class="fa icon-open-state" :class='{"fa-plus-square-o": !node.isOpen, "fa-minus-square-o": node.isOpen}'></i>
    <span :title="node.title" v-on:click="toggle(node)">
    <i v-if="showIcon(node)" :class="nodeClass(node)"></i> {{node.name}}</span>
    <a v-for="btn in node.buttons" class="ml5" href="javascript:" :title="btn.title" v-on:click="btnClick(btn, node)"><i :class="btn.icon"></i></a>
    <ul v-show="node.isOpen">
      <li v-show="node.showLoading && node._loading">
        <i class="fa fa-spinner fa-pulse"></i>
      </li>
      <tree-item v-for="item in node.children" :node="item"></tree-item>
    </ul>
  </li>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'tree-item',
  props: {
    node: {
      type: Object
    }
  },
  methods: {
    showIcon(node) {
      return node.icon || node.openedIcon || node.closedIcon;
    },
    nodeClass(node) {
      if (node.isOpen) {
        return node.openedIcon || node.icon;
      } else {
        return node.closedIcon || node.icon;
      }
    },
    toggle(node) {
      if (node.hasOwnProperty('isOpen')) {
        node.isOpen = !node.isOpen;
      } else {
        Vue.set(node, 'isOpen', true);
      }
    },
    btnClick(btn, node) {
      if (typeof btn.click === 'function') {
        btn.click(node);
      }
    }
  },
  watch: {
    'node.isOpen'(val) {
      if (!this.node.hasOwnProperty('_loading')) {
        Vue.set(this.node, '_loading', false);
      }
      if (val) {
        if (typeof this.node.onOpened === 'function') {
          this.node.onOpened(this.node);
        }
      } else {
        if (typeof this.node.onClosed === 'function') {
          this.node.onClosed(this.node);
        }
      }
    }
  }
}
</script>

<style scoped>
.vue-tree {
  font-size: 14px;
  min-height: 20px;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
}

.vue-tree li {
  margin: 0;
  padding: 5px;
  position: relative;
  list-style: none;
}

.vue-tree li > span,
.vue-tree li > i,
.vue-tree li > a {
  line-height: 20px;
  vertical-align: middle;
}

.vue-tree li > a + a {
  margin-left: 5px;
}

.vue-tree li i.icon-open-state {
  font-size: 16px;
}

.vue-tree ul ul li:hover {
  background: rgba(0, 0, 0, .015)
}

.vue-tree li:after, .vue-tree li:before {
  content: '';
  left: -18px;
  position: absolute;
  right: auto
}

.vue-tree li:before {
  border-left: 1px solid #999;
  bottom: 50px;
  height: 100%;
  top: -16px;
  width: 1px;
}

.vue-tree li:after {
  border-top: 1px solid #999;
  height: 20px;
  top: 17px;
  width: 22px
}

.vue-tree li span {
  display: inline-block;
  padding: 3px 5px;
  text-decoration: none;
}

.vue-tree > ul > li::after, .vue-tree > ul > li:before {
  border: 0
}

.vue-tree li:last-child::before {
  height: 34px
}

.vue-tree > ul {
  padding-left: 0
}

.vue-tree ul ul {
  padding-left: 24px;
  padding-top: 10px
}
</style>
