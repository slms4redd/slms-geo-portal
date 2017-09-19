<template>
  <div class="label-edit">
    <span id="label">{{label}}</span>
    <div v-for="label in value">
      <label>{{langName(label.language)}}: <input type="text" v-model="label.label"></label>
    </div>
  </div>
</template>

<script>
import { languages } from 'config'

export default {
  props: ['value', 'label'],
  methods: {
    langName(langCode) {
      const language = languages.find(l => l.id === langCode)
      return language ? language.label : langCode
    }
  }
}
</script>

<style scoped>
input {
  width: 250px;
  margin-bottom: 9px;
}
label {
  width: 30px;
}
.label-edit {
  border: 1px dashed grey;
  padding: 8px;
  margin-top: 8px;
  margin-bottom: 10px;
}
</style>
