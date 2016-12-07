import Vue from 'vue'
import Vuex from 'vuex'
import layersJson from '../api/layersJson'

Vue.use(Vuex)

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  layers: [],
  contexts: [],
  groups: {},
  layerInfo: null, // a modal with the file content is shown when not null
  contextsTimes: {}
}

// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  receive_layers(state, { layersConf }) {
    state.layers = layersConf.layers;
    state.contexts = layersConf.contexts;
    state.groups = layersConf.groups;

    const contextsTimes = {};
    state.contexts.forEach(c => {
      if (c.times) {
        contextsTimes[c.id] = c.times[c.times.length - 1];
      }
    });
    state.contextsTimes = contextsTimes
  },
  toggle_context(state, { contextId, active }) {
    const context = state.contexts.find(c => c.id === contextId);
    if (context) {
      context.active = !!active;
    }
  },
  show_layer_info(state, { fileName, label }) {
    state.layerInfo = { fileName: fileName, label: label };
  },
  set_context_time(state, { contextId, time}) {
    const newContextsTimes = {};
    // Make a shallow copy of the contextsTimes object
    for (let t in state.contextsTimes) {
      if (state.contextsTimes.hasOwnProperty(t)) {
        newContextsTimes[t] = state.contextsTimes[t];
      }
    }
    newContextsTimes[contextId] = time;
    state.contextsTimes = newContextsTimes;
  }
}

// actions are functions that causes side effects and can involve
// asynchronous operations.
const actions = {
  getAllLayers({ commit }) {
    layersJson.getLayers(Vue.config.lang, layersConf => commit('receive_layers', { layersConf }))
  },
  showLayerInfo({ commit, state }, { fileName, label }) {
    commit('show_layer_info', { fileName: fileName, label: label });
  },
  hideLayerInfo({ commit, state }) {
    commit('show_layer_info', { fileName: null, label: null });
  }
}

// getters are functions
const getters = {
  layers: state => state.layers,
  contexts: state => state.contexts,
  groups: state => state.groups,
  // activeContexts: state => state.contexts.filter(context => context.active),
  activeLayers: state => {
    const activeLayers = [];
    state.contexts.filter(context => context.active)
                  .forEach(context => context.layers.forEach(layer => activeLayers.push(layer)));
    // Delete duplicates, in case a layer belongs to many contexts
    return activeLayers.filter((elem, pos, arr) => arr.indexOf(elem) === pos);
  },
  layerInfo: state => state.layerInfo,
  queryableLayers: (state, getters) => getters.activeLayers.filter(layer => layer.statistics),
  // times: (state, getters) => getters.activeLayers.reduce((allTimes, layer) => allTimes.concat(layer.times), [])
  //                                                .filter((elem, pos, arr) => arr.findIndex(el => +el.date === +elem.date) === pos) // remove duplicates
  contextsTimes: state => state.contextsTimes
}

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state,
  getters,
  actions,
  mutations
})
