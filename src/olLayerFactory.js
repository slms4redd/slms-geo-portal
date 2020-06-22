import OSM from 'ol/source/OSM'
import BingMaps from 'ol/source/BingMaps'
import XYZ from 'ol/source/XYZ'
import TileWMS from 'ol/source/TileWMS'
import TileLayer from 'ol/layer/Tile'
import { map as mapConfig } from 'config'

import GoogleLayer from 'olgm/layer/Google'

const attributions = []

class OlLayerFactory {
  static createOlLayer(layerConfig, locale) {
    let source

    switch (layerConfig.type) {
      case 'osm':
        source = new OSM()
        break
      case 'bing-aerial':
        source = new BingMaps({
          key: mapConfig.bingMapsKey,
          imagerySet: 'Aerial'
          // use maxZoom 19 to see stretched tiles instead of the BingMaps
          // "no photos at this zoom level" tiles
          // maxZoom: 19
        })
        break
      case 'esri':
        source = new XYZ({
          attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
        })
        break
      case 'google':
        return new GoogleLayer({
          mapTypeId: 'satellite'
        })
      default:
        const layerAttributions = [],
              sourceLabel = layerConfig.sourceLabel,
              sourceLink = layerConfig.sourceLink,
              attributionKey = sourceLabel || sourceLink

        if (attributionKey) {
          let attribution = attributions[attributionKey]
          if (!attribution) {
            if (sourceLink) {
              attribution = `<a target="_blank" href="${sourceLink}">${attributionKey}</a>`
            } else {
              attribution = sourceLabel
            }
          }
          attributions[attributionKey] = attribution
          layerAttributions.push(attribution)
        }

        const style = layerConfig.styles && layerConfig.styles.find(s => s.language === locale).label // TODO 'label' should be renamed to 'value'
        source = new TileWMS(({
          urls: layerConfig.serverUrls,
          params: {
            'LAYERS': layerConfig.name,
            'STYLES': style || undefined,
            'VERSION': '1.3.0',
            'FORMAT': layerConfig.imageFormat,
            'WIDTH': 256,
            'HEIGHT': 256,
            'CRS': 'EPSG:3857',
            'TILED': true,
            // TODO not sure if these are the correct values for tilesorigin
            'tilesorigin': '-20037508.34,-20037508.34'
          },
          serverType: 'geoserver',
          attributions: layerAttributions
        }))
    }
    if (source) {
      return new TileLayer({
        visible: false, // will be set by the activeLayers watch in MapPane
        source: source,
        opacity: layerConfig.opacity || 1
      })
    }
  }
}

export default OlLayerFactory
