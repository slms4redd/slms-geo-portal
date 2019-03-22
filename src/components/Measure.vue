<template>
  <div id="measureOptions" class="hidden">
    <select id="measureToolType" class="hidden" v-model="toolTypeSelected">
      <option value="length">Length (LineString)</option>
      <option value="area">Area (Polygon)</option>
    </select>
  </div>
</template>

<script>

import Collection from 'ol/Collection'
import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Circle from 'ol/style/Circle'
import Overlay from 'ol/Overlay'
import Polygon from 'ol/geom/Polygon'
import LineString from 'ol/geom/LineString'
import { unByKey } from 'ol/Observable'
import { getLength, getArea } from 'ol/sphere'
import Draw from 'ol/interaction/Draw'
import KML from 'ol/format/KML'
import { mapState } from 'vuex'
import map from '../map'

const drawLayer = null
let drawInteraction = null
let typeSelect

const ovrlyList = new Collection()

const source = new VectorSource()

const vector = new VectorLayer({
  source: source,
  style: new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new Stroke({
      color: '#ffcc33',
      width: 2
    }),
    image: new Circle({
      radius: 7,
      fill: new Fill({
        color: '#ffcc33'
      })
    })
  })
})

/**
 * Currently drawn feature.
 * @type {Feature}
 */
let sketch

/**
 * The help tooltip element.
 * @type {Element}
 */
let helpTooltipElement

/**
 * Overlay to show the help messages.
 * @type {Overlay}
 */
let helpTooltip

/**
 * The measure tooltip element.
 * @type {Element}
 */
let measureTooltipElement

/**
 * Overlay to show the measurement.
 * @type {Overlay}
 */
let measureTooltip

/**
 * Message to show when the user is drawing a polygon.
 * @type {string}
 */
const continuePolygonMsg = 'Click to continue drawing the polygon'

/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */
const continueLineMsg = 'Click to continue drawing the line'

/**
 * Handle pointer move.
 * @param {MapBrowserEvent} evt The event.
 */
const pointerMoveHandler = function(evt) {
  if (evt.dragging) {
    return
  }
  /** @type {string} */
  let helpMsg = 'Click to start drawing'

  if (sketch) {
    const geom = (sketch.getGeometry())
    if (geom instanceof Polygon) {
      helpMsg = continuePolygonMsg
    } else if (geom instanceof LineString) {
      helpMsg = continueLineMsg
    }
  }

  if (helpTooltip) {
    helpTooltipElement.innerHTML = helpMsg
    helpTooltip.setPosition(evt.coordinate)

    helpTooltipElement.classList.remove('hidden')
  }
}

/**
 * Format length output.
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */
const formatLength = function(line) {
  const length = getLength(line)
  let output
  if (length > 100) {
    output = (Math.round(length / 1000 * 100) / 100) +
        ' ' + 'km'
  } else {
    output = (Math.round(length * 100) / 100) +
        ' ' + 'm'
  }
  return output
}

/**
 * Format area output.
 * @param {Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
const formatArea = function(polygon) {
  const area = getArea(polygon)
  let output
  if (area > 10000) {
    output = (Math.round(area / 1000000 * 100) / 100) +
        ' ' + 'km<sup>2</sup>'
  } else {
    output = (Math.round(area * 100) / 100) +
        ' ' + 'm<sup>2</sup>'
  }
  return output
}

let draw, listener

function drawStartlistener(evt) {
  // console.log('Draw START')
  // set sketch
  sketch = evt.feature

  /** @type {Coordinate|undefined} */
  let tooltipCoord = evt.coordinate

  listener = sketch.getGeometry().on('change', function(evt) {
    const geom = evt.target
    let output
    if (geom instanceof Polygon) {
      output = formatArea(geom)
      tooltipCoord = geom.getInteriorPoint().getCoordinates()
    } else if (geom instanceof LineString) {
      output = formatLength(geom)
      tooltipCoord = geom.getLastCoordinate()
    }
    measureTooltipElement.innerHTML = output
    measureTooltip.setPosition(tooltipCoord)
  })
}

function drawEndListener() {
  // console.log('Draw END')
  measureTooltipElement.className = 'tooltip tooltip-static'
  measureTooltip.setOffset([0, -7])
  // unset sketch
  sketch = null
  // unset tooltip so that a new one can be created
  measureTooltipElement = null
  createMeasureTooltip()
  unByKey(listener)
}

function addInteraction() {
  typeSelect = document.getElementById('measureToolType')
  // console.log('Got type ' + typeSelect.value)
  const type = (typeSelect.value === 'area' ? 'Polygon' : 'LineString')
  draw = new Draw({
    source: source,
    type: type,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new Stroke({
        color: 'rgba(255,69,0, 0.5)',
        lineDash: [10, 10],
        width: 2
      }),
      image: new Circle({
        radius: 5,
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.7)'
        }),
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        })
      })
    })
  })
  map.addInteraction(draw)
  // console.log('interaction set')

  draw.on('drawstart', drawStartlistener, this)
  draw.on('drawend', drawEndListener, this)
  // console.log('listeners set')
}

/**
 * Creates a new help tooltip
 */
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement)
  }
  helpTooltipElement = document.createElement('div')
  helpTooltipElement.className = 'tooltip hidden'
  helpTooltip = new Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left'
  })
  helpTooltip.setMap(map)
  // map.addOverlay(helpTooltip)
}

/**
 * Creates a new measure tooltip
 */
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement)
  }
  measureTooltipElement = document.createElement('div')
  measureTooltipElement.className = 'tooltip tooltip-measure'
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  })
  // map.addOverlay(measureTooltip)
  measureTooltip.setMap(map)
  ovrlyList.push(measureTooltip)
}

export default {
  mounted: function() {
    this.$nextTick(function() {
      createMeasureTooltip()
      createHelpTooltip()
    })
  },
  watch: {
    measureActive(enable) {
      // console.log("I'm in the watch - measureActive")
      if (enable) {
        // console.log('MEASURE ENABLED')
        addInteraction()
        if (pointerMoveHandler && vector) {
          // Add temporarly to the map
          vector.setMap(map)
          helpTooltip.setMap(map)
          measureTooltip.setMap(map)
          map.on('pointermove', pointerMoveHandler)
          /*
          map.getViewport().addEventListener('mouseout', function() {
            helpTooltipElement.classList.add('hidden')
          })
          */
          if (typeSelect) typeSelect.classList.remove('hidden')
          document.getElementById('measureOptions').classList.remove('hidden')
          if (helpTooltipElement) helpTooltipElement.classList.remove('hidden')
        }
      } else {
        // console.log('MEASURE DISABLED')

        // Remove from the map
        vector.setMap(null)
        source.clear()
        helpTooltip.setMap(null)
        measureTooltip.setMap(null)
        map.removeInteraction(draw)

        map.un('pointermove', pointerMoveHandler)
        if (typeSelect) typeSelect.classList.add('hidden')
        document.getElementById('measureOptions').classList.add('hidden')
        if (helpTooltipElement) {
          helpTooltipElement.classList.add('hidden')
        }

        draw.un('drawstart', drawStartlistener)
        draw.un('drawend', drawEndListener)

        ovrlyList.forEach(
          function(o) {
            o.setMap(null)
          }
        )
        // ovrlyList.clear()
      }
    },
    draw() {
      if (!this.draw) return

      if (drawInteraction) map.removeInteraction(drawInteraction)
      drawInteraction = new Draw({
        source: this.drawSource,
        type: this.draw
      })
      map.addInteraction(drawInteraction)
    }
  },
  methods: {
    setDrawTool(type) {
      this.draw = type
    },
    sendFeedback() {
      const allFeatures = drawLayer.getSource().getFeatures(),
            format = new KML(),
            kml = format.writeFeatures(allFeatures, { featureProjection: 'EPSG:3857' }),
            xhr = new XMLHttpRequest(),
            _this = this

      xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) alert('Feedback sent')
          else alert('Error sending feedback\n' + this.responseText)

          _this.disableFeedback()
        }
      }

      const params = `category=${this.selectedCategory}&message=${this.message}&kml=${kml}`

      // xhr.open('POST', feedbackApi.feedbackUrl, true)
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

      xhr.send(params)
    },
    disableFeedback() {
      this.$store.commit('enable_feedback', { enable: false })
    },
    clear() {
      drawLayer.getSource().clear()
    }
  },
  computed: {
    drew: function() {
      return !!(this.drawSource && this.drawSource.getFeatures().length)
    },
    disableSend: function() {
      return !(this.drew && this.message !== '' && this.selectedCategory !== '')
    },
    toolTypeSelected: {
      get() {
        // console.log('GET')
        return 'length'
      },
      set(optionValue) {
        // console.log('SET ' + optionValue)
        map.removeInteraction(draw)
        draw.un('drawstart', drawStartlistener)
        draw.un('drawend', drawEndListener)
        addInteraction()
      }
    },
    ...mapState([
      'measureActive'
    ])
  }
}
</script>

<style>

  .hidden{
    display: none
  }

  #measureOptions {
    /* background: rgb(0, 0, 0); */
    background: rgba(255,69,0, 0.66);
    font-size: 14px;
    position: absolute;
    top: 100px;
    right: 280px;
    color: white;
    padding: 10px;
    border-radius: 5px;
    margin: 0;
    z-index: 1000;
  }


.tooltip {
  position: relative;
  background: rgba(255,69,0 , 0.5);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  opacity: 0.7;
  white-space: nowrap;
}
.tooltip-measure {
  opacity: 1;
  font-weight: bold;
}
.tooltip-static {
  background-color: #ffcc33;
  color: black;
  border: 1px solid white;
}
.tooltip-measure:before,
.tooltip-static:before {
  border-top: 6px solid rgba(255,69,0, 0.5);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: "";
  position: absolute;
  bottom: -6px;
  margin-left: -7px;
  left: 50%;
}
.tooltip-static:before {
  border-top-color: #ffcc33;
}
</style>
