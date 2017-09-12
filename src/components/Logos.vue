<template>
  <div>
    <ul>
      <li v-for="logo in logosList" :key="logo.url">
        <a v-if="logo.link" :href="logo.link" target="_blank">
          <img v-if="logo.imgUrl" :src="logo.imgUrl" :width="logo.size.width" :height="logo.size.height"></img>
          <span v-if="logo.text">{{logo.text}}</span>
        </a>
        <template v-else>
          <img v-if="logo.imgUrl" :src="logo.imgUrl" :width="logo.size.width" :height="logo.size.height"></img>
          <span v-if="logo.text">{{logo.text}}</span>
        </template>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    logosList: Array
  }
}
</script>

<style scoped>
ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
ul li {
  margin-left: 10px;
  display: inline;
}
ul li a {
  display: inline-block;
  color: #fff;
  text-decoration: none;
  font-weight: bold;
}
ul li img {
  vertical-align: middle;
}
</style>
