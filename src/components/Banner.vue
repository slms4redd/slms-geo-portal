<template>
  <div id="header">
    <div id="header-content">
      <h1>SLMS sample portal</h1>
    </div>
  </div>
</template>

<script>
export default {
  name: 'banner'
}
</script>

<style lang="scss" scoped>
@import "../assets/global.scss";

h1 {
  font-weight: normal;
}

#header {
  background-color: black;
  /* Opacity */
  -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=50)";
  filter: alpha(opacity=80);
  -moz-opacity: 0.80;
  -khtml-opacity: 0.8;
  opacity: 0.8;

  color: white;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: $banner-height;
  padding: 0;
  margin: 0;
}

#header #header-content {
  margin: 10px;
}
</style>
