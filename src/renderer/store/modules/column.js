const state = {
  columns: [],
  ddl: ''
}

const mutations = {
  FETCHED_COLUMNS (state, payload) {
    state.columns = payload
  },
  FETCHED_DDL (state, payload) {
    state.ddl = payload
  }
}

const actions = {
  fetchedColumns ({commit}, payload) {
    commit('FETCHED_COLUMNS', payload)
  },
  fetchedDDL ({commit}, payload) {
    commit('FETCHED_DDL', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
