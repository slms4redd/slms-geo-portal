import { getLocalizedLabels } from './util'
import { map as mapConfig } from 'config'

export default class Layer {
  constructor(layerConfig) {
    this.id = Layer.nextId++
    this.originalId = layerConfig.id
    this.type = layerConfig.type || 'wms'
    if (this.type === 'wms') {
      // Backwards compatibility - all layers will have the serverUrls attribute
      this.serverUrls = layerConfig.serverUrls || mapConfig.defaultGeoServerURLs
      // The urls attribute will be deleted when saving
      // this.urls = layerConfig.serverUrls ? layerConfig.serverUrls : (mapConfig.defaultGeoServerURLs || null)
      this.name = layerConfig.wmsName || layerConfig.name || null
      this.styles = getLocalizedLabels(layerConfig.styles)
      this.imageFormat = layerConfig.imageFormat || 'image/png8'
      this.legend = layerConfig.legend || null // TODO check structure
      this.opacity = layerConfig.opacity || 1

      const tTimes = layerConfig.times || []
      this.times = tTimes.map(time => ({
        iso8601: time,
        humanReadable: time // TODO - create a humanReadable function
      }))

      this.statistics = layerConfig.statistics && layerConfig.statistics.map(s => {
        const ret = {
          type: s.type,
          labels: s.labels
        }
        switch (s.type) {
          case 'url':
            ret.url = s.url
            break
          case 'attributes':
            ret.attributes = s.attributes && s.attributes.map(a => ({
              attribute: a.attribute,
              labels: a.labels || a.attribute
            }))
            break
          default:
            throw new Error(`Unsupported statistics type: ${s.type}`)
        }

        return ret
      })
      this.downloadLinks = layerConfig.downloadLinks
    }

    this.visible = !!layerConfig.visible
    this.sourceLink = layerConfig.sourceLink || null
    this.sourceLabel = layerConfig.sourceLabel || null
  }

  static nextId = 0
}
