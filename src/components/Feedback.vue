<template>
  <div id="feedback" v-if="enableFeedback">
    <div v-if="categories.length" id="feedback-category">
      <select v-model="selectedCategory">
        <option value="" disabled>{{$t("feedback.selectCategory")}}</option>
        <option v-for="cat in categories" :key="cat.id">{{cat}}</option>
      </select>
    </div>
    <div id="tools">
      Draw:
      <button v-if="drawOptions.includes('Point')" type="button" class="small" :class="{ active: draw === 'Point' }" @click="setDrawTool('Point')">Points</button>
      <button v-if="drawOptions.includes('Polygon')" type="button" class="small" :class="{ active: draw === 'Polygon' }" @click="setDrawTool('Polygon')">Polygons</button>
    </div>
    <div id="sender" v-if="senderEmailIsRequired">
      <input
      id="message-sender"
      v-model="senderEmail"
      type="email"
      name="email"
      placeholder="Write your email"
      >
    </div>
    <div id="message">
      <textarea v-model="message" id="message-text" rows="6" placeholder="Write your message"></textarea>
    </div>
    <div id="buttons">
      <button type="button" class="small" @click="disableFeedback">Cancel</button>
      <button type="button" class="small" @click="clear" :disabled="drew === false">Clear</button>
      <button type="button" class="small danger" @click="sendFeedback" :disabled="disableSend">Send</button>
    </div>
  </div>
</template>

<script>

import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import Draw from 'ol/interaction/Draw'
import KML from 'ol/format/KML'
import { mapState } from 'vuex'
import map from '../map'
import { feedbackApi } from 'config'

let drawLayer = null,
    drawInteraction = null

export default {
  data() {
    return {
      drawSource: null,
      senderEmailIsRequired: feedbackApi.askForEmail || false,
      senderEmail: '',
      message: '',
      draw: null,
      categories: feedbackApi.feedbackCategories || [],
      selectedCategory: '',
      drawOptions: feedbackApi.drawOptions || ['Point', 'Polygon'],
      drawDefault: feedbackApi.drawDefault || 'Polygon'
    }
  },
  watch: {
    enableFeedback(enable) {
      if (enable) {
        this.drawSource = new VectorSource({ wrapX: false })

        drawLayer = new VectorLayer({
          source: this.drawSource,
          map: map
        })
        if (this.drawOptions.includes(this.drawDefault || 'Polygon')) {
          this.draw = this.drawDefault || 'Polygon'
        } else {
          this.draw = this.drawOptions[0]
        }
      } else {
        this.message = ''
        this.selectedCategory = ''
        map.removeInteraction(drawInteraction)
        this.clear()
        map.removeLayer(drawLayer)
        this.draw = null
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

      let params = `category=${this.selectedCategory}&message=${this.message}&kml=${kml}`

      if (feedbackApi.askForEmail) {
        params += `&sender=${this.senderEmail}`
      }

      xhr.open('POST', feedbackApi.feedbackUrl, true)
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

      xhr.send(params)
    },
    disableFeedback() {
      this.$store.commit('enable_feedback', { enable: false })
    },
    clear() {
      drawLayer && drawLayer.getSource().clear()
    },
    validEmail(email) {
      /* eslint no-useless-escape: "off" */
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(email)
    }
  },
  computed: {
    drew: function() {
      return !!(this.drawSource && this.drawSource.getFeatures().length)
    },
    disableSend: function() {
      // A valid Email is required
      if (this.senderEmailIsRequired && !this.validEmail(this.senderEmail)) {
        return true
      }
      // If categories are configured, a category is required
      // A message is required
      // A drawing is required
      return !(this.drew && this.message !== '' && !(this.categories.length !== 0 && this.selectedCategory === ''))
    },
    ...mapState([
      'enableFeedback'
    ])
  }
}
</script>

<style scoped>
  #feedback {
    /* background: rgb(0, 0, 0); */
    background: rgba(0, 0, 0, 0.66);
    font-size: 14px;
    position: absolute;
    bottom: 8px;
    left: 8px;
    color: white;
    padding: 10px;
    border-radius: 5px;
    backdrop-filter: blur(5px);
    margin: 0;
    z-index: 1000;
  }
  #feedback > * {
    margin-bottom: 10px;
  }
  #message-text {
    font-size: 12px;
    resize: none;
    box-sizing: border-box;
    width: 100%;
  }
  #tools button:not(.active) {
    background-color: rgba(255, 255, 255, 0.7);
  }
  #buttons {
    margin-bottom: 0;
  }
</style>
