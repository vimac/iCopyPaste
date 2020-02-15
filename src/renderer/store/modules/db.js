const state = {
  config: {
    connected: 'no'
  }
}

const mutations = {
  SUBMIT_CONFIG (state, payload) {
    state.config = Object.assign({}, state.config, payload)
  },
  SUBMIT_CONNECTION_STATUS (state, payload) {
    state.config = Object.assign({}, state.config, payload)
  }
}

const actions = {
  submitConfig ({commit}, payload) {
    commit('SUBMIT_CONFIG', payload)
  },
  submitConnectionStatus ({commit}, payload) {
    commit('SUBMIT_CONNECTION_STATUS', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
