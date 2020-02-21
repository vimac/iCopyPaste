const state = {
  modelList: []
}

const mutations = {
  UPDATE_MODELS (state, payload) {
    state.modelList = payload
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
