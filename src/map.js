const config = require("./assets/config.json");

export default new ol.Map({
  controls: ol.control.defaults({
    attributionOptions: ({ collapsible: false })
  }),
  view: new ol.View({
    center: ol.proj.fromLonLat(config.mapCenterLonLat || [0, 0]),
    zoom: config.mapZoom || 4
  })
});
