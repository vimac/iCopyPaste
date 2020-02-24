const state = {
  tables: []
}

const mutations = {
  FETCHED_TABLES (state, payload) {
    state.tables = payload
  }
}

const actions = {
  fetchedTables ({commit}, payload) {
    commit('FETCHED_TABLES', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
