import Vue from 'vue'
import Vuex from 'vuex'
// vuex-electron lost maintenance and its persistedState is buggy
// import {createPersistedState, createSharedMutations} from 'vuex-electron'
import {createSharedMutations} from 'vuex-electron'
import createPersistedState from './yet-another-persisted-state'

import modules from './modules'

Vue.use(Vuex)

export default new Vuex.Store({
  modules,
  plugins: [
    createPersistedState({
      storageKey: 'i-copy-paste',
      whitelist: [
        {mutation: 'ADD_CONNECTION', watchStateKey: 'store'},
        {mutation: 'SET_CONNECTIONS', watchStateKey: 'store'},
        {mutation: 'SUBMIT_SETTINGS', watchStateKey: 'settings'}
      ]
    }),
    createSharedMutations()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
