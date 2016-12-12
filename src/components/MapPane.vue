<template>
  <div id="map"></div>
</template>

<script>
import OlLayerFactory from '../olLayerFactory';
import { mapGetters } from 'vuex'
import map from '../map';
import { Layer } from '../config'

const olLayers = {}

export default {
  name: 'mapPane',
  mounted() {
    map.setTarget('map');
  },

  watch: {
    layers(layers) {
      // layers.forEach(layerConfig => {
      //   try {
      //     const olLayer = OlLayerFactory.createOlLayer(layerConfig);
      //     if (olLayer) {
      //       olLayers[layerConfig.id] = olLayer;
      //       map.addLayer(olLayer);
      //     }
      //   } catch (e) {
      //     console.log(e);
      //   }
      // });
    },
    activeLayers(activeLayers) {
      // Group layers to save bandwidth
      const groupedLayers = activeLayers.reduce((grouped, l) => {
        const lastGroup = grouped[grouped.length - 1];
        if (!lastGroup) {
          grouped.push([l]);
          return grouped;
        }
        const lastItem = lastGroup[lastGroup.length - 1];
        if (lastItem.type === 'WMS' && l.type === 'WMS') {
          // Add to last group
          lastGroup.push(l);
          return grouped;
        }
        // create another group
        grouped.push([l]);
        return grouped;
      }, []);

      map.getLayers().forEach(l => map.removeLayer(l));

      groupedLayers.forEach(group => {
        if (group[0].type === 'WMS') {
          const groupedWmsNames = group.reduce((layersStr, layer) => {
            const visible = layer.visible && activeLayers.find(a => a.id === layer.id);
            if (visible) {
              return layersStr === '' ? layer.wmsName : layersStr + ',' + layer.wmsName;
            } else {
              return layersStr;
            }
          }, '');

          const source = new ol.source.TileWMS(({
            urls: group[0].urls,
            params: {
              'LAYERS': groupedWmsNames,
              'TILED': true,
              'VERSION': '1.3.0',
              'FORMAT': 'image/png8',
              'WIDTH': 256,
              'HEIGHT': 256,
              'CRS': 'EPSG:3857'
            },
            serverType: 'geoserver'
          }));
          map.addLayer(new ol.layer.Tile({
            source: source
          }));
        }
      });

      // this.layers.forEach(l =>
      //   olLayers[l.id].setVisible(l.visible && activeLayers.find(a => a.id === l.id)));
    },
    contextsTimes(contextsTimes) {
      // for (let contextId in contextsTimes) {
      //   if (contextsTimes.hasOwnProperty(contextId) && contextsTimes[contextId]) {
      //     const context = this.contexts.find(c => c.id === contextId);
      //     context.layers.forEach(l => {
      //       olLayers[l.id].getSource().updateParams({'TIME': contextsTimes[contextId].date.toISOString()});
      //     });
      //   }
      // }
    }
  },

  computed: mapGetters([
    'layers',
    'contexts',
    'activeLayers',
    'contextsTimes'
  ])
}
</script>

<style scoped>
#map {
  height: 100%;
  width: 100%;
}
</style>

<style lang="scss">
@import "../assets/global.scss";

.ol-zoom {
  top: $banner-height + 5px;
}
.ol-dragzoom {
  border-color: #999;
  border-width: 2px;
  border-style: dashed;
}
</style>
