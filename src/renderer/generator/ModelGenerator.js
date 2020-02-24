import {
  convertSQLTypeToNative,
  getDataObjectFilename,
  getDataObjectFullName,
  getDataObjectNamespace,
  getDataObjectShortName,
  ucfirst,
  underscoreToCamelCase
} from './GeneratorUtil'

import fs from 'fs'
import path from 'path'
import doT from 'dot'

const getDataModelMeta = {
  myspot: (database, table) => {
    return {
      name: getDataObjectShortName.myspot(database, table),
      filename: getDataObjectFilename(database, table),
      fullName: getDataObjectFullName(database, table),
      table,
      fileType: 'dataModel'
    }
  }
}

const dataModelGenerators = {
  myspot: (database, tableName, fetchedColumns) => {
    let template = fs.readFileSync(path.join(__static, '/template/PHPDataObject.dot'), 'utf8')
    const render = doT.template(template)
    let columns = []
    fetchedColumns.forEach(item => {
      const newName = underscoreToCamelCase(item.name)
      columns.push({
        name: newName,
        comment: item.comment,
        type: convertSQLTypeToNative(item.type),
        getterName: 'get' + ucfirst(newName),
        setterName: 'set' + ucfirst(newName),
        originalName: item.name
      })
    })
    const vars = {
      className: getDataObjectShortName.myspot(database, tableName),
      columns: columns,
      database: ucfirst(underscoreToCamelCase(database)),
      doNamespace: getDataObjectNamespace(database)
    }
    return render(vars)
  }
}

export default {
  install (Vue, options) {
    let modelGenerator

    modelGenerator = {
      getDataObjectMetaDataByTables (type, database, tables) {
        return tables.map(table => getDataModelMeta[type](database, table))
      },
      getDataModelByTable (type, ...args) {
        return dataModelGenerators[type](...args)
      }
    }

    Vue.prototype.$modelGenerator = modelGenerator
  }
}
