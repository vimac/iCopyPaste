const state = {
  tables: {},
  selected: ''
}

const mutations = {
  FETCHED_TABLES (state, payload) {
    state.tables = Object.assign({}, state.tables, payload)
  },
  SELECT_TABLE (state, payload) {
    state.selected = payload
  }
}

const actions = {
  fetchedTables ({commit}, payload) {
    commit('FETCHED_TABLES', payload)
  },
  selectTable ({commit}, payload) {
    commit('SELECT_TABLE', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
