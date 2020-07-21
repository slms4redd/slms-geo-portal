import { OSM, BingMaps, XYZ, TileWMS, ImageWMS } from 'ol/source'
import { Tile as TileLayer, Image as ImageLayer } from 'ol/layer'
import { map as mapConfig } from 'config'

import GoogleLayer from '@geosolutions/olgm/layer/Google'

const attributions = []

class OlLayerFactory {
  static createOlLayer(layerConfig, locale) {
    let source
    let sourceType

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
              attributionKey = sourceLabel || sourceLink,
              wmsType = layerConfig.wmsType || 'tiled'

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
        const sourceConfig = {
          urls: layerConfig.serverUrls,
          params: {
            'LAYERS': layerConfig.name,
            'STYLES': style || undefined,
            'VERSION': '1.3.0',
            'FORMAT': layerConfig.imageFormat,
            'WIDTH': 256,
            'HEIGHT': 256,
            'CRS': 'EPSG:3857'
          },
          serverType: 'geoserver',
          attributions: layerAttributions
        }

        if (wmsType === 'single') {
          // Single Image WMS
          source = new ImageWMS(({
            ...sourceConfig,
            url: layerConfig.serverUrls[0],
            ratio: 1
          }))
          sourceType = wmsType
        } else {
          // Tiled WMS
          source = new TileWMS(({
            ...sourceConfig,
            params: {
              ...sourceConfig.params,
              'TILED': true,
              // TODO not sure if these are the correct values for tilesorigin
              'tilesorigin': '-20037508.34,-20037508.34'
            }
          }))
        }
    }
    if (source) {
      const config = {
        visible: false, // will be set by the activeLayers watch in MapPane
        source: source,
        opacity: layerConfig.opacity || 1
      }
      if (sourceType) return new ImageLayer(config)
      return new TileLayer(config)
    }
  }
}

export default OlLayerFactory
