<template>
  <div id="feedback" v-if="enableFeedback">
    <div id="feedback-category">
      <select v-model="selectedCategory">
        <option value="" disabled>Please select a category</option>
        <option v-for="cat in categories">
          <option>{{cat}}</option>
        </option>
      </select>
    </div>
    <div id="tools">
      Draw:
      <button type="button" class="small" v-bind:class="{ active: draw === 'Point' }" @click="setDrawTool('Point')">Points</button>
      <button type="button" class="small" v-bind:class="{ active: draw === 'Polygon' }" @click="setDrawTool('Polygon')">Polygons</button>
    </div>
    <div id="message">
      <textarea v-model="message" id="message-text" rows="6" placeholder="Write your message"></textarea>
    </div>
    <div id="buttons">
      <button type="button" class="small" @click="disableFeedback">Cancel</button>
      <button type="button" class="small" @click="clear" v-bind:disabled="drew === false">Clear</button>
      <button type="button" class="small danger" @click="sendFeedback" v-bind:disabled="disableSend">Send</button>
    </div>
  </div>
</template>

<script>
/* global ol */

import { mapState } from 'vuex';
import map from '../map';
import config from '../assets/config.json';

let drawLayer = null,
    drawInteraction = null;

export default {
  data() {
    return {
      drawSource: null,
      message: '',
      draw: null,
      categories: config.feedbackCategories,
      selectedCategory: ''
    };
  },
  watch: {
    enableFeedback(enable) {
      if (enable) {
        this.drawSource = new ol.source.Vector({ wrapX: false });

        drawLayer = new ol.layer.Vector({
          source: this.drawSource,
          map: map
        });

        this.draw = 'Polygon';
      } else {
        this.message = '';
        this.selectedCategory = '';
        map.removeInteraction(drawInteraction);
        this.clear();
        map.removeLayer(drawLayer);
        this.draw = null;
      }
    },
    draw() {
      if (!this.draw) return;

      if (drawInteraction) {
        map.removeInteraction(drawInteraction);
      }
      drawInteraction = new ol.interaction.Draw({
        source: this.drawSource,
        type: this.draw
      });
      map.addInteraction(drawInteraction);
    }
  },
  methods: {
    setDrawTool(type) {
      this.draw = type;
    },
    sendFeedback() {
      const allFeatures = drawLayer.getSource().getFeatures(),
            format = new ol.format.KML(),
            kml = format.writeFeatures(allFeatures, { featureProjection: 'EPSG:3857' }),
            xhr = new XMLHttpRequest(),
            _this = this;

      xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) {
            alert('Feedback sent');
          } else {
            alert('Error sending feedback\n' + this.responseText);
          }
          _this.disableFeedback();
        }
      };

      const params = `category=${this.selectedCategory}&message=${this.message}&kml=${kml}`;

      xhr.open('POST', config.feedbackUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

      xhr.send(params);
    },
    disableFeedback() {
      this.$store.commit('enable_feedback', { enable: false });
    },
    clear() {
      drawLayer.getSource().clear();
    }
  },
  computed: {
    drew: function() {
      return !!(this.drawSource && this.drawSource.getFeatures().length);
    },
    disableSend: function() {
      return !(this.drew && this.message !== '' && this.selectedCategory !== '');
    },
    ...mapState([
      'enableFeedback'
    ])
  }
};
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
  }
  #message-text {
    font-size: 12px;
    resize: none;
    box-sizing: border-box;
    width: 100%;
    margin-top: 10px;
    margin-bottom: 10px;
  }
  #tools button:not(.active) {
    background-color: rgba(255, 255, 255, 0.7);
  }
  #feedback-category {
    margin-bottom: 10px;
  }
</style>
