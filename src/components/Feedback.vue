<template>
  <div id="feedback" v-if="enableFeedback">
    <div id="tools">
      Draw:
      <button class="small" v-bind:class="{ active: draw === 'Point' }" @click="setDrawTool('Point')">Points</button>
      <button class="small" v-bind:class="{ active: draw === 'Polygon' }" @click="setDrawTool('Polygon')">Polygons</button>
    </div>
    <div id="message">
      <textarea v-model="message" id="message-text" rows="6" placeholder="Write your message"></textarea>
    </div>
    <div id="buttons">
      <button class="small" @click="disableFeedback">Cancel</button>
      <button class="small" @click="clear" v-bind:disabled="disableSend == true">Clear</button>
      <button class="small danger" @click="sendFeedback" v-bind:disabled="this.disableSend">Send</button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import map from '../map'

let drawLayer = null,
    drawInteraction = null;

export default {
  data() {
    return {
      drawSource: null,
      message: '',
      draw: null
    }
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
            format = new ol.format.GeoJSON(),
            jsonGeom = format.writeFeaturesObject(allFeatures),
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
      }

      xhr.open("POST", 'http://localhost:3000/feedback', true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

      jsonGeom.message = document.getElementById("message-text").value;
      xhr.send(JSON.stringify(jsonGeom));
    },
    disableFeedback() {
      this.$store.commit('enable_feedback', { enable: false })
    },
    clear() {
      drawLayer.getSource().clear();
    }
  },
  computed: {
    disableSend: function() {
      const drew = this.drawSource && this.drawSource.getFeatures().length,
            wrote = this.message !== '';

      return !(drew && wrote);
    },
    ...mapGetters([
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
</style>
