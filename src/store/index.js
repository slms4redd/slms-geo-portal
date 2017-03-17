import Vue from 'vue';
import Vuex from 'vuex';
import { getLayers, Group, Context } from '../config';

Vue.use(Vuex);

let _layersConf = null;

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  layers: [],
  contexts: [],
  groups: null,
  layerInfo: null, // a modal with the file content is shown when not null
  contextsTimes: [],
  kmlOverlay: null,
  enableFeedback: false,
  activeContextsIds: []
};

// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  add_group(state) {
    const newGroup = new Group({
      label: 'New group'
    });
    state.groups.items.push(newGroup);
  },
  add_context(state) {
    const newContext = new Context({
      label: 'New context'
    });
    state.groups.items.push(newContext);
  },
  receive_layers(state, { layersConf }) {
    _layersConf = layersConf;
    state.layers = layersConf.layers;
    state.contexts = layersConf.contexts;
    state.groups = layersConf.groups;

    const contextsTimes = [];
    const activeContextsIds = [];
    state.contexts.forEach(c => {
      if (c.times) contextsTimes[c.id] = c.times[c.times.length - 1];
      if (c.active) activeContextsIds.push(c.id);
    });
    state.contextsTimes = contextsTimes;
    state.activeContextsIds = activeContextsIds;
  },
  toggle_context(state, { contextId }) {
    const context = state.contexts.find(c => c.id === contextId);
    if (context) {
      const idx = state.activeContextsIds.indexOf(contextId);
      if (idx === -1) state.activeContextsIds.push(contextId);
      else state.activeContextsIds.splice(idx, 1);
    }
  },
  show_layer_info(state, { fileName, label }) {
    state.layerInfo = { fileName: fileName, label: label };
  },
  set_context_time(state, { contextId, time }) {
    state.contextsTimes.splice(contextId, 1, time);
  },
  overlay_kml(state, { kml }) {
    state.kmlOverlay = kml;
  },
  enable_feedback(state, { enable }) {
    state.enableFeedback = enable;
  },
  update_group(state, { groupId, value }) {
    const group = state.groups.findById(groupId);
    if (group) group.items = value;
    console.log(_layersConf.serialize()); // DEBUG
  }
};

// actions are functions that causes side effects and can involve
// asynchronous operations.
const actions = {
  getAllLayers({ commit }) {
    getLayers(Vue.config.lang)
      .then(layersConf => commit('receive_layers', { layersConf }))
      .catch(error => alert(error));
  },
  showLayerInfo({ commit, state }, { fileName, label }) {
    commit('show_layer_info', { fileName: fileName, label: label });
  },
  hideLayerInfo({ commit, state }) {
    commit('show_layer_info', { fileName: null, label: null });
  }
};

// getters are functions
const getters = {
  activeLayers: state => {
    const activeLayers = [];
    state.contexts.filter(context => state.activeContextsIds.indexOf(context.id) !== -1)
                  .forEach(context => context.layers.forEach(layer => activeLayers.push(layer)));
    // Delete duplicates, in case a layer belongs to many contexts
    return activeLayers.filter((elem, pos, arr) => arr.indexOf(elem) === pos);
  },
  queryableLayers: (state, getters) => getters.activeLayers.filter(layer => layer.statistics)
};

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state,
  getters,
  actions,
  mutations
});
