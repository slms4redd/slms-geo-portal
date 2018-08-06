import Map from 'ol/Map'
import View from 'ol/View'
import MousePosition from 'ol/control/MousePosition'
import { defaults as defaultControls, Attribution } from 'ol/control'
import { createStringXY } from 'ol/coordinate'
import { fromLonLat } from 'ol/proj'
import { map as mapConfig } from 'config'

const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(4),
  projection: 'EPSG:4326',
  undefinedHTML: '&nbsp;'
})

export default new Map({
  controls: defaultControls({
    attribution: false,
    zoom: true
  })
  .extend([mousePositionControl])
  .extend([new Attribution({
    collapsible: false
  })]),
  view: new View({
    center: fromLonLat(mapConfig.mapCenterLonLat || [0, 0]),
    zoom: mapConfig.mapZoom || 4
  })
})
