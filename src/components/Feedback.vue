<template>
  <div id="feedback-buttons" v-if="enableFeedback">
    <button class="small" @click="sendFeedback" v-bind:disabled="this.disableSend">Send feedback</button>
    <button class="small" @click="clear" v-bind:disabled="disableSend == true">Clear</button>
    <button class="small" @click="disableFeedback">Cancel</button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import map from '../map'

export default {
  data() {
    return {
      drawLayer: null,
      drawInteraction: null
    }
  },
  // mounted() {
  // },
  watch: {
    enableFeedback(enable) {
      if (enable) {
        const source = new ol.source.Vector({wrapX: false});

        this.drawLayer = new ol.layer.Vector({
          source: source,
          map: map
        });

        this.drawInteraction = new ol.interaction.Draw({
          source: source,
          type: ('Polygon')
        });

        map.addInteraction(this.drawInteraction);
      } else {
        map.removeInteraction(this.drawInteraction);
        this.clear();
        map.removeLayer(this.drawLayer);
        // this.drawLayer.getSource().clear();
      }
    }
  },
  methods: {
    sendFeedback() {
      const allFeatures = this.drawLayer.getSource().getFeatures(),
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

      jsonGeom.message = "That's all Folks!";
      xhr.send(JSON.stringify(jsonGeom));
    },
    disableFeedback() {
      this.$store.commit('enable_feedback', { enable: false })
    },
    clear() {
      this.drawLayer.getSource().clear();
    }
  },
  computed: {
    disableSend: function() {
      return !(this.drawLayer && this.drawLayer.getSource() && this.drawLayer.getSource().getFeatures().length);
    },
    ...mapGetters([
      'enableFeedback'
    ])
  }
}
</script>

<style scoped>
  #feedback-buttons {
    bottom: 8px;
    left: 8px;
    position: absolute;
  }
  /*
  button {
    font-size: 12px;
  }
  button:disabled {
    background-color: LightGrey;
    color: grey;
  }
  */
</style>
