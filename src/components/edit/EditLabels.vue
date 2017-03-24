<template>
  <span>
    <span v-for="label in labels">
      <label class="short-input">{{label.language}}: <input class="short-input" type="text" v-model="label.label"></label>
      <br>
    </span>
  </span>
</template>

<script>
export default {
  props: {
    labels: Array
  }
};
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
