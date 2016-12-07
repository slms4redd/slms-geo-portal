<template>
  <div class="dropdown">
    <div class="dropdown-content">
      <template v-for="time in times"><span @click="set(time)" v-bind:class="{ selected: time === selectedTime }">{{time.humanReadable}}</span><br></template>
    </ul>
  </div>
</template>

<script>
import { config } from 'vue'

export default {
  props: {
    times: Array,
    selectedTime: Object
  },
  methods: {
    set(time) {
      this.$emit('setTime', time);
    }
  }
}
</script>

<style scoped>

.dropdown-content {
    right: 0;
    top: 0;
    color: #fff;
    padding-left: 3px;
}
.selected {
  font-weight: bold;
}
</style>
