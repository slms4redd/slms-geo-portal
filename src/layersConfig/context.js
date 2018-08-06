import Item from './item'

export default class Context extends Item {
  constructor(contextConfig, layers) {
    super(contextConfig)

    // Keeps track of the original id to be used in the Group constructor but creates a new one for internal use
    // The original id can be a String but we use an incremental unique id for contexts and groups
    this.originalId = contextConfig.id
    this.active = !!contextConfig.active

    const findLayerById = (arr, id) => arr.find(item => item.originalId === id)
    const tLayers = contextConfig.layers &&
                    contextConfig.layers.map(id => findLayerById(layers, id))
                                        .filter(layer => !!layer) // Silently remove nulls (unmatched layers)
    this.layers = tLayers || []
    this.inlineLegendUrl = contextConfig.inlineLegendUrl || null
  }

  get hasLegends() {
    // The context has a legend if any of his layers has one
    // i.e. if any of is layers has a legend attribute or a styles attribute with a not null label
    return this.layers.some(layer => layer.legend || layer.styles && layer.styles.some(s => s.label))
  }

  legend(locale) {
    return this.layers.map(layer => {
      let legendUrl = null
      if (layer.legend) {
        // Custom legend if defined
        if (layer.legend.type === 'wms') {
          const wmsLegendStyle = layer.legend.style.replace('$(_lang)', locale)
          legendUrl = `${layer.serverUrls[0]}?LEGEND_OPTIONS=fontColor:ffffff;fontAntiAliasing:true
&LAYER=${layer.name}&STYLE=${wmsLegendStyle}&REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=18&HEIGHT=18&TRANSPARENT=true`
        } else {
          legendUrl = layer.legend.url
          // legendUrl = `/static/configuration/loc/${Vue.i18n.locale()}/images/${layer.legend.url}`
        }
      } else if (layer.styles) {
        // Get legend URL from the (localized) style
        // TODO fallback legend
        const style = layer.styles.find(l => l.language === locale)
        const wmsLegendStyle = style ? style.label : null
        legendUrl = `${layer.serverUrls[0]}?LEGEND_OPTIONS=fontColor:ffffff;fontAntiAliasing:true
&LAYER=${layer.name}&STYLE=${wmsLegendStyle}&REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=18&HEIGHT=18&TRANSPARENT=true`
      }
      return legendUrl
    }).filter(url => url)
  }
}
