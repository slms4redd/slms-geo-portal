<template>
  <div>
    <ul>
      <li v-for="logo in logosList" v-bind:key="logo.url">
        <a v-if="logo.link" v-bind:href="logo.link" target="_blank">
          <img v-bind:src="logo.imgUrl" v-bind:width="logo.size.width" v-bind:height="logo.size.height"></img>
        </a>
        <img v-else v-bind:src="logo.imgUrl" v-bind:width="logo.size.width" v-bind:height="logo.size.height"></img>
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
}
ul li img {
  vertical-align: middle;
}
</style>
