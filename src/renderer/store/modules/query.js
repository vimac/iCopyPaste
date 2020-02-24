const state = {
  queries: []
}

const mutations = {
  UPDATE_QUERIES (state, payload) {
    state.queries = payload
  },
  ADD_QUERY (state, payload) {
    state.queries.push(payload)
  }
}

const actions = {
  updateQueries ({commit}, payload) {
    commit('UPDATE_QUERIES', payload)
  },
  addQuery ({commit}, payload) {
    commit('ADD_QUERY', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
