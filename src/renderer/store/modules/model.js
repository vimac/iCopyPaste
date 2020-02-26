const state = {
  models: []
}

const mutations = {
  UPDATE_MODELS (state, payload) {
    state.models = payload
  }
}

const actions = {
  updateModels ({commit}, payload) {
    commit('UPDATE_MODELS', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
