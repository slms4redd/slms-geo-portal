/* eslint no-template-curly-in-string: "off" */

import httpRequest from '../httpRequest'
import auth from '../auth'
import Layer from './layer'
import Context from './context'
import Group from './group'
import { layersConfigApi as api, map as mapConfig } from 'config'
import printRequest from '../assets/print.json'
import map from '../map'

class _Config {
  constructor(json) {
    const layers = json.layers.map(layerConf => new Layer(layerConf)),
          contexts = json.contexts.map(contextConf => new Context(contextConf, layers))

    this.groups = new Group(json.group, contexts, null)

    // Delete the contexts that are not in a group
    this.contexts = contexts.filter(c => this.groups.findById(c.id))

    // Delete the layers that are not in a context
    this.layers = layers.filter(l => this.contexts.some(c => c.layers.indexOf(l) !== -1))

    // Set layers opacity
    this.contexts.forEach(c => {
      c.layers.forEach(l => { l.opacity = c.opacity })
    })
  }
}

export function getLayers() {
  return new Promise((resolve, reject) => {
    const url = api.baseUrl + api.getLayersConfigUrl
    httpRequest('GET', url)
      .then(responseText => resolve(new _Config(JSON.parse(responseText))))
      .catch(error => reject(error.statusText || error.message))
  })
}

function serializeConfiguration(groupConfig, layersRank) {
  // Gather all the contexts and layers
  // We are not using the layers array directly because we want to remove unused layers from the configuration
  const contextsConfig = groupConfig.recReduce((acc, current) => acc.concat(current), [])
  let layersConfig = groupConfig.recReduce((acc, current) => [].concat.apply(acc, current.layers), [])
  layersConfig = layersRank.map(id => layersConfig.find(l => l.id === id)).filter(x => x)

  // Clean up before exporting
  const layerReplacer = (key, value) => {
    switch (key) {
      case 'originalId': // TODO the originalId attribute will be removed
      case 'urls':
      case 'opacity': // opacity is a property of the context
        return undefined
      case 'serverUrls':
        return value || undefined
      case 'legend':
      case 'sourceLink':
      case 'sourceLabel':
        return value || undefined
      case 'times':
        const t = value.map(t => t.iso8601)
        return t && t.length ? t : undefined
      case 'styles':
        // Delete style languages with no label (not localized)
        const styles = value.map(s => s.label ? s : null).filter(s => !!s)
        // Don't save the style array if it's empty
        return styles.length ? styles : undefined
      default:
        return value
    }
  }
  const layers = JSON.parse(JSON.stringify(layersConfig, layerReplacer))

  const contextReplacer = (key, value) => {
    switch (key) {
      case 'layers':
        return value.length ? value.map(l => l.id) : undefined
      case 'inlineLegendUrl':
      case 'infoFile':
        return value || undefined
      case 'parent':
      case 'hasLegends':
      case 'times':
      case 'originalId': // TODO the originalId attribute will be removed
        return undefined
      default:
        return value
    }
  }
  const contexts = JSON.parse(JSON.stringify(contextsConfig, contextReplacer))

  const groupReplacer = (key, value) => {
    switch (key) {
      case '': // Root
        // Remove the label attribute from the root
        return {
          exclusive: value.exclusive,
          items: value.items
        }
      case 'id':
      case 'parent':
        return undefined
      case 'infoFile':
        return value || undefined
      case 'items':
        if (value.length === 0) return undefined
        return value.map(item => item.isGroup ? { group: item } : { context: item.id })
      default:
        return value
    }
  }
  const group = JSON.parse(JSON.stringify(groupConfig, groupReplacer))

  const obj = {
    $schema: '../../layersJsonSchema_v2.json', // TODO
    layers: layers,
    contexts: contexts,
    group: group
  }

  return JSON.stringify(obj)
}

export function saveConfiguration(conf, layersRank) {
  const url = api.baseUrl + api.saveLayersConfigUrl
  return httpRequest('POST', url, serializeConfiguration(conf, layersRank), [['Content-Type', 'application/json'], ['Authorization', auth.getAuthToken()]])
}

export function getConfigurationHistory() {
  return new Promise((resolve, reject) => {
    const url = api.baseUrl + api.getLayersConfigHistoryUrl
    httpRequest('GET', url, null, [['Authorization', auth.getAuthToken()]])
      .then(responseText => resolve(JSON.parse(responseText)))
      .catch(error => reject(error))
  })
}

export function restoreVersion(version) {
  const url = api.baseUrl + api.restoreVersionUrl + '?version=' + version
  return httpRequest('GET', url, null, [['Authorization', auth.getAuthToken()]])
}

export function getPrintRequest(activeLayers, activeContexts, locale, annotationLayers) {
  // get the map scale
  // const scale = INCHES_PER_UNIT[units] * DOTS_PER_INCH * resolution;
  const scales = [1128, 2256, 4513, 9027, 18055, 36111, 72223, 144447, 288895, 577790, 1155581,
    2311162, 4622324, 9244649, 18489298, 36978596, 73957193, 147914387, 295828775, 591657550]
  const scale = Math.round(39.37 * 90 * map.getView().getResolution())
  const printScale = scales.find(s => s >= scale) || scales.slice(-1)[0]

  printRequest.pages[0].center = map.getView().getCenter()
  printRequest.pages[0].scale = printScale

  const visibleActiveLayers = activeLayers.filter(layer => !!layer.visible)
  if (!visibleActiveLayers.length) return // TODO notify the user

  // Reverse the order of WMS layers only
  let reversedWmsGroups = visibleActiveLayers.reduce((grouped, layer) => {
    switch (layer.type) {
      case 'osm':
      case 'bing-aerial':
      case 'esri':
        grouped.push([layer])
        return grouped
      case 'wms':
        if (!grouped.length) grouped.push([])
        const lastGroup = grouped[grouped.length - 1]
        if (!lastGroup.length || (lastGroup[0].type === 'wms' && lastGroup[0].serverUrls[0] !== layer.serverUrls[0])) {
          lastGroup.unshift(layer)
          return grouped
        } else {
          grouped.push([layer])
          return grouped
        }
    }
  }, [])

  // Flatten the two level structure
  reversedWmsGroups = [].concat.apply([], reversedWmsGroups)

  // Layers
  const baseConfig = {
    maxExtent: [-20037508.3392, -20037508.3392, 20037508.3392, 20037508.3392],
    tileSize: [256, 256],
    resolutions: [156543.0339, 78271.51695, 39135.758475, 19567.8792375, 9783.93961875, 4891.969809375, 2445.9849046875, 1222.99245234375, 611.496226171875, 305.7481130859375, 152.87405654296876, 76.43702827148438, 38.21851413574219, 19.109257067871095, 9.554628533935547, 4.777314266967774, 2.388657133483887, 1.1943285667419434, 0.5971642833709717],
    singleTile: false
  }

  const patchRelativeBaseUrl = (url) => {
    if (url && url.startsWith('/')) {
      return mapConfig.defaultGeoServerURLs[0]
    } else {
      return url
    }
  }

  printRequest.layers = reversedWmsGroups.map(layer => {
    if (!layer.visible) return null

    switch (layer.type) {
      case 'wms':
        return {
          type: 'wms',
          layers: [layer.name],
          baseURL: patchRelativeBaseUrl(layer.serverUrls[0]),
          format: layer.imageFormat
        }
      case 'osm':
        return {
          ...baseConfig,
          type: 'OSM',
          baseURL: 'http://a.tile.openstreetmap.org/',
          extension: 'png'
        }
      case 'esri':
        return {
          ...baseConfig,
          type: 'XYZ',
          baseURL: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile',
          extension: 'jpg',
          path_format: '/${z}/${y}/${x}'
        }
      default:
        return null
    }
  }).filter(l => !!l)

  // Include vector/annotation layer in the print request when present
  if (annotationLayers) {
    printRequest.layers = [...printRequest.layers, {
      type: 'Vector',
      name: 'Annotations',
      opacity: 1,
      styleProperty: 'vector_style',
      styles: {},
      geoJson: annotationLayers
    }]
  }

  const legends = []
  printRequest.legends = activeContexts.forEach(context => {
    const contextLabel = context.labels.find(l => l.language === locale).label
    if (context.inlineLegendUrl) {
      // Return the inline context legend
      legends.push({
        classes: [{
          icons: [context.inlineLegendUrl],
          name: ''
        }],
        name: contextLabel
      })
    } else if (context.hasLegends) {
      const legend = {
        classes: [],
        name: contextLabel
      }
      context.layers.forEach(l => {
        if (!l.legend) return

        switch (l.legend.type) {
          case 'url':
            if (!l.legend.url.startsWith('http://') && !l.legend.url.startsWith('https://')) {
              legend.classes.push({
                icons: [window.location.origin + window.location.pathname + l.legend.url],
                name: ''
              })
            } else {
              legend.classes.push({
                icons: [l.legend.url],
                name: ''
              })
            }
            break
          case 'wms':
            let wmsLegendStyle
            if (l.legend) {
              // Custom legend if defined
              wmsLegendStyle = l.legend.style.replace('$(_lang)', locale)
            } else if (l.styles) {
              // Get legend URL from the (localized) style
              // TODO fallback legend
              const style = l.styles.find(l => l.language === locale)
              wmsLegendStyle = style ? style.label : null
            }
            const legendUrl = `${patchRelativeBaseUrl(l.serverUrls[0])}?LEGEND_OPTIONS=fontColor:000000;fontAntiAliasing:true&LAYER=${l.name}&STYLE=${wmsLegendStyle}&REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=18&HEIGHT=18&TRANSPARENT=true`

            legend.classes.push({
              icons: [legendUrl],
              name: ''
            })
            break
          default:
            return
        }
      })
      legends.push(legend)
    }
  })

  printRequest.legends = legends.filter(l => !!l)

  return printRequest
}
