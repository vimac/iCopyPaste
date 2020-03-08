import {defaultTarget, myBatisDefaults, mySpotDefaults} from '../../constants/defaults'

const state = {
  target: defaultTarget,
  myspot: mySpotDefaults,
  mybatis: myBatisDefaults
}

const mutations = {
  SUBMIT_SETTINGS (state, payload) {
    state.myspot = Object.assign({}, state.myspot, payload.myspot)
    state.mybatis = Object.assign({}, state.mybatis, payload.mybatis)
    if (payload.target) {
      state.target = payload.target
    }
  },
  LOAD_ALL_SETTINGS (state, payload) {
    state = Object.assign(state, payload)
  },
  RESET_SETTINGS (state, payload) {
    state.target = defaultTarget
    state.myspot = mySpotDefaults
    state.mybatis = myBatisDefaults
  }
}

const actions = {
  submitSettings ({commit}, payload) {
    commit('SUBMIT_SETTINGS', payload)
  },
  loadAllSettings ({commit}, payload) {
    commit('LOAD_ALL_SETTINGS', payload)
  },
  resetSettings ({commit}, payload) {
    commit('RESET_SETTINGS', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
