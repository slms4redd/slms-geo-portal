<template>
  <span>
    <br>
    <span v-for="lang in value">
      {{lang.id}}
      <select>
        <option value="">Default</option>
        <option v-for="option in options" :value="option">
          {{option}}
        </option>
      </select>
      <br>
    </span>
  </span>
</template>

<script>
export default {
  props: ['value', 'options']
}
</script>

<style scoped>
input[type=text] {
  width: 300px;
  display: block;
  margin-bottom: 9px;
}
label {
  display: block;
}
label.short-input {
  display: inline;
}
input[type=text].short-input {
  width: 270px;
  margin-bottom: 9px;
  display: inline;
}
</style>
