const state = {
  storedList: []
}

const mutations = {
  ADD_CONNECTION (state, payload) {
    state.storedList = payload.reduce((acc, current) => {
      const found = acc.find(item => item.host === current.host &&
        item.port === current.port &&
        item.database === current.database &&
        item.user === current.user &&
        item.pass === current.pass
      )
      if (found) {
        return acc
      } else {
        return acc.concat([current])
      }
    }, state.storedList)
  },
  SET_CONNECTIONS (state, payload) {
    state.storedList = payload
  }
}

const actions = {
  addConnection ({commit}, payload) {
    commit('ADD_CONNECTION', payload)
  },
  setConnections ({commit}, payload) {
    commit('SET_CONNECTIONS', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
