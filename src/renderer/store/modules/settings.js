import {mySpotDefaults} from '../../constants/defaults'

const state = {
  target: 'myspot',
  myspot: mySpotDefaults
}

const mutations = {
  SUBMIT_SETTINGS (state, payload) {
    state.myspot = Object.assign({}, state.myspot, payload)
  },
  LOAD_ALL_SETTINGS (state, payload) {
    state = Object.assign(state, payload)
  }
}

const actions = {
  submitSettings ({commit}, payload) {
    commit('SUBMIT_SETTINGS', payload)
  },
  loadAllSettings ({commit}, payload) {
    commit('LOAD_ALL_SETTINGS', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
