import {mySpotDefaults} from '../../constants/defaults'

const state = {
  target: 'php+myspot',
  myspot: mySpotDefaults
}

const mutations = {
  SUBMIT_SETTINGS (state, payload) {
    state.myspot = Object.assign({}, state.myspot, payload)
  }
}

const actions = {
  submitSettings ({commit}, payload) {
    commit('SUBMIT_SETTINGS', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
