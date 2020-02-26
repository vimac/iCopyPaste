import {sequelizeBridge} from '../util/SequelizeBridge'
import {modelGenerator} from './ModelGenerator'
import {
  generateBaseDAOTemplate,
  generateDAOCode,
  generateMySpotConfig,
  generateMySpotConfigs,
  generateMySpotSQL
} from './MySpotGenerator'

export const fileContentGenerator = {
  ddl (database, table) {
    return new Promise((resolve, reject) => {
      sequelizeBridge.fetchTableDDL(database, table).then(ddl => {
        resolve({code: ddl, payload: {}})
      }).catch(reject)
    })
  },
  dataModel (database, table) {
    return new Promise((resolve, reject) => {
      sequelizeBridge.fetchColumns(database, table).then(fetchedColumns => {
        resolve({code: modelGenerator.getDataModelByTable('myspot', database, table, fetchedColumns), payload: {}})
      }).catch(reject)
    })
  },
  sql (database, table, params) {
    return new Promise((resolve, reject) => {
      try {
        const {queryType, columns, fields, where, order, limitType} = params
        const {sqlTemplate, sqlTemplateInline, mixedSql} = generateMySpotSQL(database, table, queryType, columns, fields, where, order, limitType)
        resolve({code: mixedSql, payload: {sqlTemplate, sqlTemplateInline}})
      } catch (e) {
        reject(e)
      }
    })
  },
  mySpotConfiguration (database, table, params) {
    return new Promise((resolve, reject) => {
      try {
        const {queryType, fields, where, returnType, sqlTemplateInline} = params
        const {configTemplate, configTemplateItem, queryName, configTemplateName, filename} = generateMySpotConfig(database, table, queryType, fields, where, returnType, sqlTemplateInline)
        resolve({code: configTemplate, payload: {configTemplateItem, queryName, configTemplateName, filename}})
      } catch (e) {
        reject(e)
      }
    })
  },
  mySpotConfigurations (database, table, params) {
    return new Promise((resolve, reject) => {
      try {
        const {filename, configs} = params
        const {configTemplate} = generateMySpotConfigs(database, table, filename, configs)
        resolve({code: configTemplate, payload: {}})
      } catch (e) {
        reject(e)
      }
    })
  },
  mySpotDAO (database, table, params) {
    console.log('test', params)
    return new Promise((resolve, reject) => {
      try {
        const {code} = generateDAOCode(database, table, [params])
        resolve({code, payload: {}})
      } catch (e) {
        reject(e)
      }
    })
  },
  mySpotDAOs (database, table, params) {
    return new Promise((resolve, reject) => {
      try {
        const {functions} = params
        const {code} = generateDAOCode(database, table, functions)
        resolve({code, payload: {}})
      } catch (e) {
        reject(e)
      }
    })
  },
  mySpotBaseDAO () {
    return new Promise((resolve, reject) => {
      try {
        const {code} = generateBaseDAOTemplate()
        resolve({code, payload: {}})
      } catch (e) {
        reject(e)
      }
    })
  }
}
