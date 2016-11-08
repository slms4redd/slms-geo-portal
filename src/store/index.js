import Vue from 'vue'
import Vuex from 'vuex'
import layersJson from '../api/layersJson'

Vue.use(Vuex)

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  layers: [],
  contexts: [],
  groups: {}
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
  },
  toggle_context(state, { context, active }) {
    // // Deep clone the context
    // const newContext = JSON.parse(JSON.stringify(contexts));
    if (context) {
      context.active = active;
    }
  }
  // increment (state) {
  //   state.count++
  // },
  // decrement (state) {
  //   state.count--
  // }
}

// actions are functions that causes side effects and can involve
// asynchronous operations.
const actions = {
  getAllLayers: ({ commit }) => {
    layersJson.getLayers(layersConf => {
      commit('receive_layers', { layersConf });
    });
  }
  // increment: ({ commit }) => commit('increment'),
  // decrement: ({ commit }) => commit('decrement'),
  // incrementIfOdd ({ commit, state }) {
  //   if ((state.count + 1) % 2 === 0) {
  //     commit('increment')
  //   }
  // },
  // incrementAsync ({ commit }) {
  //   return new Promise((resolve, reject) => {
  //     setTimeout(() => {
  //       commit('increment')
  //       resolve()
  //     }, 1000)
  //   })
  // }
}

// getters are functions
const getters = {
  layers: state => state.layers,
  contexts: state => state.contexts,
  groups: state => state.groups
  // evenOrOdd: state => state.count % 2 === 0 ? 'even' : 'odd'
}

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})


// import Vue from 'vue'
// import Vuex from 'vuex'
// import * as actions from './actions'
// import * as getters from './getters'
// import cart from './modules/cart'
// import products from './modules/products'
// import createLogger from '../../../src/plugins/logger'

// Vue.use(Vuex)

// const debug = process.env.NODE_ENV !== 'production'

// export default new Vuex.Store({
//   actions,
//   getters,
//   modules: {
//     cart,
//     products
//   },
//   strict: debug,
//   plugins: debug ? [createLogger()] : []
// })