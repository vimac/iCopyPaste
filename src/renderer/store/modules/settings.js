const state = {
  target: 'php+myspot',
  myspot: {
    // eslint-disable-next-line no-template-curly-in-string
    root: 'MyProject',
    // eslint-disable-next-line no-template-curly-in-string
    doSuffix: 'DO',
    // eslint-disable-next-line no-template-curly-in-string
    doNamespace: '${root}\\DataObject\\${database}',
    // eslint-disable-next-line no-template-curly-in-string
    daoSuffix: 'DAO',
    // eslint-disable-next-line no-template-curly-in-string
    daoNamespace: '${root}\\DAO\\${database}',
    // eslint-disable-next-line no-template-curly-in-string
    baseDaoNamespace: '${root}\\DAO'
  }
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
