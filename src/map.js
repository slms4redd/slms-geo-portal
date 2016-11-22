export default new ol.Map({
  controls: ol.control.defaults({
    attributionOptions: ({ collapsible: false })
  }),
  view: new ol.View({
    center: ol.proj.fromLonLat([37.41, 8.82]),
    zoom: 4
  })
});
