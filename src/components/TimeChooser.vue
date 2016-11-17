<template>
  <div v-show="showSlider" id="time">
    <select v-model="selectedDate">
      <option v-for="time in times" v-bind:value="time.date">
        {{ time.humanReadableTime }}
      </option>
    </select>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

// let isoDateString = function(d) {
//   // 2000-01-01T00:00:00.000Z
//   const pad = n => n < 10 ? '0' + n : n;

//   return d.getUTCFullYear() + '-'
//          + pad(d.getUTCMonth() + 1) + '-'
//          + pad(d.getUTCDate()) + 'T'
//          + pad(d.getUTCHours()) + ':'
//          + pad(d.getUTCMinutes()) + ':'
//          + pad(d.getUTCSeconds()) + '.'
//          + pad(d.getUTCMilliseconds()) + 'Z';
// };

export default {
  data() {
    return {
      selectedDate: null
    }
  },

  watch: {
    times(times) {
      console.log(times);
    }
  },

  computed: {
    showSlider() {
      return !!this.times.length;
    },
    ...mapGetters([
      'times'
    ])
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/global.scss";

#time {
  @extend %opacity;

  font-size: 14px;
  position: absolute;
  bottom: 8px;
  left: 8px;
  min-width: 50px;
  background-color: black;
  color: white;
  padding: 10px;
  overflow: auto;
  border-radius: 5px;
}
</style>
