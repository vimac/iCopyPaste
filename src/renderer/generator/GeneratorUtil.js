import store from '../store'
import doT from 'dot'

const underscoreToCamelCase = str => str.replace(/_([a-z])/g, x => x[1].toUpperCase())
const ucfirst = str => str.replace(/^./, x => x[0].toUpperCase())

const convertSQLTypeToNative = (sqlType) => {
  if (/(?:BOOL)/i.test(sqlType)) {
    return 'bool'
  } else if (/(?:INT)/i.test(sqlType)) {
    return 'int'
  } else if (/(?:DOUBLE)|(?:FLOAT)/i.test(sqlType)) {
    return 'float'
  } else {
    return 'string'
  }
}

const getDataObjectNamespace = (database) => {
  const vars = {
    root: projectSettings.myspot.rootNS,
    database: ucfirst(underscoreToCamelCase(database))
  }
  const render = doT.template(projectSettings.myspot.doNamespaceTemplate)
  return render(vars)
}

const getDataObjectShortName = {
  myspot: (database, table) => {
    return ucfirst(underscoreToCamelCase(table)) + projectSettings.myspot.doSuffix
  }
}
const getDataObjectFullName = (database, table) => {
  return '\\' + getDataObjectNamespace(database) + '\\' + ucfirst(underscoreToCamelCase(table)) + projectSettings.myspot.doSuffix
}

const projectSettings = {
  myspot: {
    rootNS: 'MyProject',
    doSuffix: 'DO',
    daoSuffix: 'DAO',
    doNamespaceTemplate: '{{=it.root}}\\DataObject\\{{=it.database}}',
    daoNamespaceTemplate: '{{=it.root}}\\DAO\\{{=it.database}}',
    baseDaoNamespaceTemplate: '{{=it.root}}\\DAO'
  }
}

const loadTemplate = (settings) => {
  projectSettings.myspot.rootNS = settings.myspot.root
  projectSettings.myspot.doSuffix = settings.myspot.doSuffix
  projectSettings.myspot.daoSuffix = settings.myspot.daoSuffix
  projectSettings.myspot.doNamespaceTemplate = settings.myspot.doNamespace.replace(/\${(\w+?)}/g, '{{=it.$1}}')
  projectSettings.myspot.daoNamespaceTemplate = settings.myspot.daoNamespace.replace(/\${(\w+?)}/g, '{{=it.$1}}')
  projectSettings.myspot.baseDaoNamespaceTemplate = settings.myspot.baseDaoNamespace.replace(/\${(\w+?)}/g, '{{=it.$1}}')
}

const generatorInstaller = {
  install (Vue, options) {
    store.subscribe((mutation, state) => {
      if (mutation.type === 'SUBMIT_SETTINGS') {
        const {myspot} = state.settings
        loadTemplate(myspot)
      }
    })
    loadTemplate(store.state.settings)
  }
}

export {
  underscoreToCamelCase,
  ucfirst,
  convertSQLTypeToNative,
  getDataObjectNamespace,
  getDataObjectShortName,
  getDataObjectFullName,
  generatorInstaller
}
