<template>
  <div id="map"></div>
</template>

<script>
let map;

export default {
  name: 'mapPane',
  layers: [],
  
  mounted() {
    map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([37.41, 8.82]),
        zoom: 4
      })
    });
  },

  methods: {
    addLayer(layer): layers.push(layer);
  }
}
</script>

<style scoped>
#map {
  height: 100%;
  width: 100%;
}
</style>


    <!--new Vue({
      el: '#app',
      data: {
        greeting: 'Welcome to your Vue.js app!',
        docsURL: 'http://vuejs.org/guide/',
        gitterURL: 'https://gitter.im/vuejs/vue',
        forumURL: 'http://forum.vuejs.org/'
      },
      methods: {
        humanizeURL: function (url) {
          return url
            .replace(/^https?:\/\//, '')
            .replace(/\/$/, '')
        }
      }
    })-->
