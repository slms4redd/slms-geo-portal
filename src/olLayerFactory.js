/* global ol */

import Vue from 'vue' // Used to get the locale - TODO pass it as a parameter to createOlLayer
import { map as mapConfig } from 'config'

const attributions = []

class OlLayerFactory {
  static createOlLayer(layerConfig) {
    let source

    switch (layerConfig.type) {
      case 'osm':
        source = new ol.source.OSM()
        break
      case 'bing-aerial':
        source = new ol.source.BingMaps({
          key: mapConfig.bingMapsKey,
          imagerySet: 'Aerial'
          // use maxZoom 19 to see stretched tiles instead of the BingMaps
          // "no photos at this zoom level" tiles
          // maxZoom: 19
        })
        break
      default:
        const olAttributions = [],
              sourceLabel = layerConfig.sourceLabel,
              sourceLink = layerConfig.sourceLink

        if (sourceLabel || sourceLink) {
          let attribution = attributions[sourceLabel || sourceLink]
          if (!attribution) {
            if (sourceLink) {
              attribution = new ol.Attribution({
                html: `<a target="_blank" href="${layerConfig.sourceLink}">${sourceLabel || sourceLink}</a>`
              })
            } else {
              attribution = new ol.Attribution({
                html: sourceLabel
              })
            }
          }
          attributions[sourceLabel || sourceLink] = attribution
          olAttributions.push(attribution)
        }
        const style = layerConfig.styles && layerConfig.styles.find(s => s.language === Vue.i18n.locale()).label // TODO 'label' should be renamed to 'value'
        source = new ol.source.TileWMS(({
          urls: layerConfig.urls,
          params: {
            'LAYERS': layerConfig.name,
            'STYLES': style || undefined,
            'TILED': true,
            'VERSION': '1.3.0',
            'FORMAT': layerConfig.imageFormat,
            'WIDTH': 256,
            'HEIGHT': 256,
            'CRS': 'EPSG:3857'
          },
          serverType: 'geoserver',
          attributions: olAttributions
        }))
    }
    if (source) {
      return new ol.layer.Tile({
        visible: false, // will be set by the activeLayers watch in MapPane
        source: source
      })
    }
  }
}

export default OlLayerFactory
