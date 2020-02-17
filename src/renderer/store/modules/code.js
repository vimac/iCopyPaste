const state = {
  dataObjectCode: '',
  sqlTemplate: '',
  sqlTemplateInline: '',
  configTemplate: '',
  configTemplateItem: '',
  configTemplateName: '',
  queryName: '',
  daoCode: '',
  daoMethodCode: '',
  baseDAOCode: ''
}

const mutations = {
  GENERATE_DO (state, payload) {
    state.dataObjectCode = payload
  },
  GENERATE_SQL_TEMPLATE (state, payload) {
    state.sqlTemplate = payload.sqlTemplate
    state.sqlTemplateInline = payload.sqlTemplateInline
    state.configTemplate = payload.configTemplate
    state.configTemplateItem = payload.configTemplateItem
    state.configTemplateName = payload.configTemplateName
    state.queryName = payload.queryName
  },
  GENERATE_DAO_CODE (state, payload) {
    state.daoCode = payload.code
    state.daoMethodCode = payload.daoMethodCode
    state.baseDAOCode = payload.baseDAOCode
  }
}

const actions = {
  generateDataObjectCode ({commit}, payload) {
    commit('GENERATE_DO', payload)
  },
  generateSQLTemplate ({commit}, payload) {
    commit('GENERATE_SQL_TEMPLATE', payload)
  },
  generateDaoCode ({commit}, payload) {
    commit('GENERATE_DAO_CODE', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
