<template>
  <div id='search' v-if="wfsSearchConfig">
    <form v-on:submit.prevent='noop'>
      <input type='text' v-model='searchText' v-on:keyup='goSearching' />
      <br /><br />
    </form>
    <div id='search-results' class='columns' v-if="results.length">
      <button type="button" class="close" aria-label="Close" @click="(results = [])">
        <span aria-hidden="true">&times;</span>
      </button>
      <div class='column'>
        <search-results v-for='result in results' v-bind="{result, clickHandler}" :key='result.id'/>
      </div>
    </div>
  </div>
</template>

<script>

import httpRequest from '../httpRequest'
import SearchResult from './SearchResult'
import map from '../map'
import { transformExtent } from 'ol/proj'
import GeoJSON from 'ol/format/GeoJSON'
import { wfsSearchConfig } from 'config'

export default {
  data: function() {
    return {
      searchText: '',
      results: [],
      wfsSearchConfig
    }
  },
  mounted: function() {
    this.$nextTick(function() {
    })
  },
  watch: {
  },
  methods: {
    clickHandler: function(clickedObject) {
      if (clickedObject && clickedObject.extent) {
        map.getView().fit(
          transformExtent(clickedObject.extent, 'EPSG:4326', 'EPSG:3857'),
          {
            size: map.getSize(),
            maxZoom: 19
          })
      }
    },
    goSearching: function(e) {
      // React to Enter key press
      if (e.keyCode === 13) {
        this.wfsSearch(this.searchText)
      }
    },
    noop() {
      // do nothing
    },
    wfsSearch(searchterm) {
      if (!wfsSearchConfig || !wfsSearchConfig.layersToQuery) {
        alert('WFS Search is not correctly configured.\nPlease contact your system administrator')
        return
      }
      if (wfsSearchConfig.layersToQuery.lenght !== wfsSearchConfig.attributesToFilter.lenght) {
        alert('WFS Search attributes list lenght does not match the number of layers to query.\nPlease contact your system administrator')
        return
      }
      const typeNameList = wfsSearchConfig.layersToQuery.join()
      const cqlFilterString = encodeURI(wfsSearchConfig.attributesToFilter.join(' ILIKE \'%' + searchterm + '%\';') + ' ILIKE \'%' + searchterm + '%\'')
      const params = 'outputFormat=application/json&maxfeatures=10&typeName=' + typeNameList + '&cql_filter=' + cqlFilterString
      const url = wfsSearchConfig.baseURL + '?service=WFS&version=1.1.0&request=GetFeature&' + params

      httpRequest('GET', url).then(response => {
        const wfsResponse = JSON.parse(response)

        if (wfsResponse.features) {
          this.results = []
          const geojsonReader = new GeoJSON()
          wfsResponse.features.forEach(function(element) {
            if (element.geometry && element.geometry.coordinates && element.properties && element.id) {
              const newres = {}
              wfsSearchConfig.layersToQuery.forEach(function(layer, idx) {
                const featureTypeString = (layer.indexOf(':') > -1) ? layer.split(':')[1] : layer
                if (element.id.indexOf(featureTypeString) > -1) {
                  newres.fromtable = layer
                  if (!newres.title || newres.title.indexOf(searchterm) === -1) {
                    newres.title = element.properties[wfsSearchConfig.attributesToFilter[idx]]
                  }
                }
              })
              newres.extent = (geojsonReader.readFeature(element)).getGeometry().getExtent()
              this.results.push(newres)
            }
          }, this)
        }
      })
      .catch(err => {
        alert('Error WFS\n' + err)
      })
    }
  },
  components: {
    'search-results': SearchResult
  }
}
</script>

<style scoped>
  #search {
    position: absolute;
    top: 108px;
    right: 60px;
  }

  #search-results {
    height: 100%;
    padding-top: 10px;
    background: #e6ecf1;
  }

  .close {
    position: absolute;
    right: 0;
  }
</style>
