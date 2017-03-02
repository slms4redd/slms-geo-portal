import config from './assets/config.json';

const mousePositionControl = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(4),
  projection: 'EPSG:4326',
  undefinedHTML: '&nbsp;'
});

export default new ol.Map({
  controls: ol.control.defaults({
    attributionOptions: ({ collapsible: false })
  }).extend([mousePositionControl]),
  view: new ol.View({
    center: ol.proj.fromLonLat(config.mapCenterLonLat || [0, 0]),
    zoom: config.mapZoom || 4
  })
});
