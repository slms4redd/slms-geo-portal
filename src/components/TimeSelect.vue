<template>
  <div class="dropdown">
    <ul class="dropdown-content">
      <li v-for="time in times" :key="time.id">
        <span @click="set(time)" :class="{ selected: time === selectedTime }">{{time.humanReadable}}</span>
        <br>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    times: Array,
    selectedTime: Object
  },
  methods: {
    set(time) {
      this.$emit('setTime', time)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/global.scss";

.dropdown-content {
    right: 0;
    top: 0;
    color: #fff;
    padding-left: 16px;
    line-height: 18px;
    list-style-type: none;
}
.selected {
  color: $highlight-color;
}
.selected:before {
  content:"• ";
}
</style>
