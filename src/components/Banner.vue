<template>
  <div id="header">
    <div id="header-content">
      <h1>{{$t("banner.title")}}</h1>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/global.scss";

h1 {
  font-weight: normal;
}
#header {
  @extend %opacity;
  background-color: black;
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
