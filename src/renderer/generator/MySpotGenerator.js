import {
  convertNameWithPrefix,
  convertSQLTypeToNative,
  convertSQLTypeToPDOType,
  getDataObjectFullName,
  getOptionalName,
  projectSettings,
  ucfirst,
  underscoreToCamelCase
} from './GeneratorUtil'
import doT, {getTemplateRender} from '../util/DotBridge'

const generateWhereTemplateVars = (where) => {
  return where.map(item => {
    // Do not modify the variable 'item' causing it will modify original object
    return {
      fieldName: item.name,
      name: underscoreToCamelCase(item.name),
      optional: item.optional,
      optionalName: getOptionalName('where', item.name),
      type: item.type
    }
  })
}

const generateOrderByTemplateVars = (order) => {
  return order.map(item => {
    // Do not modify the variable 'item' causing it will modify original object
    return {
      fieldName: item.name,
      name: underscoreToCamelCase(item.name),
      optional: item.optional,
      optionalName: getOptionalName('orderBy', item.name),
      type: item.type
    }
  })
}

const processLimit = (limitType) => {
  switch (limitType) {
    case 'no':
      return ''
    case 'limitOne':
      return 'LIMIT 1'
    case 'limitRows':
      return 'LIMIT :limitRows'
    case 'limitOffsetRows':
      return 'LIMIT :limitOffset, :limitRows'
  }
}

/** Configuration **/

export const getConfigurationFilename = (database, table, suffix = '.php') => {
  return 'config/myspot/' + database + '/' + table + suffix
}

const getConfigTemplateName = (database, table) => database + '.' + table

/** Query Generators **/

const queryGenerators = {
  select (database, table, queryType, columns, fields, where, order, limitType) {
    const render = getTemplateRender('/template/MySpot/SELECT.dot')
    where = generateWhereTemplateVars(where)
    order = generateOrderByTemplateVars(order)
    const vars = {
      database, table, columns, fields, where, order, limit: processLimit(limitType), limitType
    }
    return render(vars)
  },
  selectCount (database, table, queryType, columns, fields, where, order, limitType) {
    const render = getTemplateRender('/template/MySpot/SELECT_COUNT.dot')
    where = generateWhereTemplateVars(where)
    const vars = {database, table, fields, where}
    return render(vars)
  },
  insert (database, table, queryType, columns, fields, where, order, limitType) {
    const render = getTemplateRender('/template/MySpot/INSERT.dot')
    const params = fields.map(item => underscoreToCamelCase(item))
    const vars = {database, table, fields, params}
    return render(vars)
  },
  update (database, table, queryType, columns, fields, where, order, limitType) {
    const render = getTemplateRender('/template/MySpot/UPDATE.dot')
    where = generateWhereTemplateVars(where)
    order = generateOrderByTemplateVars(order)
    const params = fields.map(item => 'new' + ucfirst(underscoreToCamelCase(item)))
    const vars = {
      database, table, columns, fields, params, where, order, limit: processLimit(limitType)
    }
    return render(vars)
  },
  delete (database, table, queryTypes, columns, fields, where, order, limitType) {
    const render = getTemplateRender('/template/MySpot/DELETE.dot')
    where = generateWhereTemplateVars(where)
    order = generateOrderByTemplateVars(order)
    const vars = {
      database, table, fields, where, order, limit: processLimit(limitType)
    }
    return render(vars)
  }
}

/** DAO Generators **/
const getConfigTemplateNameWithQueryName = (database, table, queryName) => database + '.' + table + '.' + queryName

const getBaseDAONamespace = () => {
  const vars = {
    root: projectSettings.myspot.rootNS
  }
  const render = doT.template(projectSettings.myspot.baseDaoNamespaceTemplate)
  return render(vars)
}

const getBaseDAOShortName = () => {
  return 'Base' + projectSettings.myspot.daoSuffix
}

const getBaseDAOFullName = () => {
  return getBaseDAONamespace() + '\\' + getBaseDAOShortName()
}

const getBaseDAOFilename = () => {
  const fullName = getBaseDAOFullName().split('\\')
  fullName.shift()
  return 'src/' + fullName.join('/') + '.php'
}

const getDAOShortName = table => ucfirst(underscoreToCamelCase(table)) + projectSettings.myspot.daoSuffix

const getDAONamespace = (database) => {
  const vars = {
    root: projectSettings.myspot.rootNS,
    database: ucfirst(underscoreToCamelCase(database))
  }
  const render = doT.template(projectSettings.myspot.daoNamespaceTemplate)
  return render(vars)
}

const getDAOFullName = (database, table) => getDAONamespace(database) + '\\' + getDAOShortName(table)

const getDAOFilename = (database, table) => {
  const fullName = getDAOFullName(database, table).split('\\')
  fullName.shift()
  return 'src/' + fullName.join('/') + '.php'
}

const getArgsFromFieldsArray = (fields, columns, prefix = '') => {
  let args = []
  fields.forEach(item => {
    let columnType = ''
    columns.forEach(col => {
      if (col.name === item) {
        columnType = col.type
      }
    })
    args.push({
      name: convertNameWithPrefix(item, prefix),
      keyName: convertNameWithPrefix(item, prefix),
      phpType: convertSQLTypeToNative(columnType),
      pdoType: convertSQLTypeToPDOType(columnType),
      getter: 'get' + ucfirst(underscoreToCamelCase(item)),
      condition: false
    })
  })
  return args
}

const getArgsFromWhereArray = (where, columns) => {
  let args = []
  where.map(item => {
    let r = []
    let columnType = ''
    columns.forEach(col => {
      if (col.name === item.name) {
        columnType = col.type
      }
    })
    if (item.optional) {
      r.push({
        name: getOptionalName('where', item.name),
        keyName: getOptionalName('where', item.name),
        phpType: 'bool',
        pdoType: convertSQLTypeToPDOType('BOOL'),
        condition: true,
        conditionType: 'where',
        conditionFieldName: item.name
      })
    }
    r.push({
      name: underscoreToCamelCase(item.name),
      keyName: underscoreToCamelCase(item.name),
      phpType: item.type === 'IN' ? 'array' : convertSQLTypeToNative(columnType),
      pdoType: convertSQLTypeToPDOType(columnType),
      condition: false
    })
    return r
  }).forEach(item => {
    args = args.concat(item)
  })
  return args
}

const getArgsFromOrderArray = (order) => {
  return order.map(item => {
    if (item.optional) {
      return {
        name: getOptionalName('orderBy', item.name),
        keyName: getOptionalName('orderBy', item.name),
        phpType: 'bool',
        pdoType: convertSQLTypeToPDOType('BOOL'),
        condition: true,
        conditionType: 'order',
        conditionFieldName: item.name
      }
    }
  }).filter(item => item)
}

const getArgsFromLimitType = (limitType) => {
  let args = []
  if (limitType === 'limitRows') {
    args.push({
      name: 'limitRows',
      keyName: 'limitRows',
      phpType: 'int',
      pdoType: convertSQLTypeToNative('INT'),
      condition: false
    })
  } else if (limitType === 'limitOffsetRows') {
    args.push({
      name: 'limitOffset',
      keyName: 'limitOffset',
      phpType: 'int',
      pdoType: convertSQLTypeToNative('INT'),
      condition: false
    })
    args.push({
      name: 'limitRows',
      keyName: 'limitOffset',
      phpType: 'int',
      pdoType: convertSQLTypeToNative('INT'),
      condition: false
    })
  }
  return args
}

const getRequiredParamsFromWhereAndLimit = (where, limitType) => {
  let required = where.map(item => {
    if (!item.optional) {
      return underscoreToCamelCase(item.name)
    }
  }).filter(item => item)

  if (limitType === 'limitRows') {
    required.push('limitRows')
  } else if (limitType === 'limitOffsetRows') {
    required.push('limitOffset')
    required.push('limitRows')
  }

  return required
}

const getFuncArgs = (limitType, incomingArgs = [], database = null, table = null, overrideName = null) => {
  let funcArgs = []
  if (limitType === 'plain') {
    funcArgs = incomingArgs.map(item => {
      return {
        name: item.name,
        keyName: item.name,
        type: item.phpType,
        condition: item.condition,
        conditionType: item.conditionType || null,
        conditionFieldName: item.conditionFieldName || null
      }
    })
  } else if (limitType === 'array') {
    funcArgs.push({name: overrideName || 'sqlArguments', type: 'array', condition: false})
  } else if (limitType === 'do') {
    funcArgs.push({name: 'sourceObject', type: getDataObjectFullName(database, table), condition: false})
  }
  return funcArgs
}

const getArgsFromColumns = (columns, prefix = '') => {
  return columns.map(item => {
    if (item.key === 'PRI' && item.extra === 'auto_increment') {
      return false
    }
    return {
      name: convertNameWithPrefix(item.name, prefix),
      keyName: item.name,
      phpType: convertSQLTypeToNative(item.type),
      pdoType: convertSQLTypeToPDOType(item.type),
      getter: 'get' + ucfirst(underscoreToCamelCase(item.name)),
      condition: false
    }
  }).filter(item => item)
}

const getReturnTemplate = (queryType, returnType, limitType, fullDataObjectName = '') => {
  let isArray = false
  let commentReturnType = null
  let comment = ''
  let realType
  switch (returnType) {
    case 'sqlMapResult':
      commentReturnType = '\\MySpot\\SqlMapResult'
      comment = 'Executed result'
      realType = commentReturnType
      break
    case 'do':
      realType = 'array'
      if (limitType !== 'limitOne') {
        isArray = true
        realType = fullDataObjectName
      }
      commentReturnType = fullDataObjectName
      comment = 'DataObject' + (isArray ? ' array' : '')
      break
    case 'stdClass':
      realType = 'array'
      if (limitType !== 'limitOne') {
        isArray = true
        commentReturnType = '\\stdClass'
      }
      commentReturnType = '\\stdClass'
      comment = 'Anonymous object' + (isArray ? ' array' : '')
      break
    case 'array':
      if (limitType !== 'limitOne') {
        isArray = true
      }
      commentReturnType = 'array'
      realType = commentReturnType
      comment = 'Result set in array'
      break
    case 'lines':
      commentReturnType = 'int'
      realType = commentReturnType
      comment = 'Affected lines'
      break
    case 'lastInsertId':
      commentReturnType = 'int'
      realType = commentReturnType
      comment = 'Last insert ID'
      break
    case 'onlyValue':
      commentReturnType = 'mixed'
      if (queryType === 'selectCount') {
        comment = 'Counted lines'
      }
      break
  }
  return {isArray, commentReturnType, comment, realType, returnType}
}

const dotRender = getTemplateRender('/template/MySpot/DAOFragments.dot')

const renderMySpotDAO = (queryName, queryType, database, table, vars) => {
  return dotRender({
    className: getDAOShortName(table),
    daoNamespace: getDAONamespace(database),
    baseDAOName: getBaseDAOFullName(),
    shortBaseDAOName: getBaseDAOShortName(),
    functions: [{
      queryName,
      methodName: queryType,
      queryType,
      database,
      table,
      fullQueryName: getConfigTemplateNameWithQueryName(database, table, queryName),
      ...vars
    }]
  })
}

const generalSelect = (queryName, queryType, database, table, columns, fields, where, order, limitType, argsType, returnType) => {
  let args = getArgsFromWhereArray(where, columns)
  args = args.concat(getArgsFromOrderArray(order))
  args = args.concat(getArgsFromLimitType(limitType))
  const funcArgs = getFuncArgs(argsType, args)
  let required = getRequiredParamsFromWhereAndLimit(where, limitType)
  const returnTemplate = getReturnTemplate(queryType, returnType, limitType, getDataObjectFullName(database, table))
  const vars = {
    funcArgs,
    args,
    argsType,
    required,
    returnTemplate
  }
  return renderMySpotDAO(queryName, queryType, database, table, vars)
}

const daoGenerations = {
  select (queryName, queryType, database, table, columns, fields, where, order, limitType, argsType, returnType) {
    return generalSelect(...arguments)
  },
  selectCount (queryName, queryType, database, table, columns, fields, where, order, limitType, argsType, returnType) {
    let args = getArgsFromWhereArray(where, columns)
    let required = []
    limitType = 'limitOne'
    const funcArgs = getFuncArgs(argsType, args)
    const returnTemplate = getReturnTemplate(queryType, returnType, limitType)
    const vars = {
      funcArgs,
      args,
      argsType,
      required,
      returnTemplate
    }
    return renderMySpotDAO(queryName, queryType, database, table, vars)
  },
  insert (queryName, queryType, database, table, columns, fields, where, order, limitType, argsType, returnType) {
    let required = []
    if (argsType === 'array') {
      required = fields
    }
    let args
    if (fields.length === 0) {
      args = getArgsFromColumns(columns)
    } else {
      args = getArgsFromFieldsArray(fields, columns)
    }
    limitType = 'limitOne'
    const returnTemplate = getReturnTemplate(queryType, returnType, limitType)
    const funcArgs = getFuncArgs(argsType, args, database, table)
    const vars = {
      funcArgs,
      args,
      argsType,
      required,
      returnTemplate
    }
    return renderMySpotDAO(queryName, queryType, database, table, vars)
  },
  update (queryName, queryType, database, table, columns, fields, where, order, limitType, argsType, returnType) {
    let updateArguments = []
    let args = []
    let funcArgs = []
    if (fields.length === 0 && argsType === 'plain') {
      updateArguments = getArgsFromColumns(columns, 'new')
      funcArgs = getFuncArgs(argsType, updateArguments, database, table)
    } else {
      updateArguments = []
      args = getArgsFromFieldsArray(fields, columns, 'new')
    }

    args = args.concat(getArgsFromWhereArray(where, columns))
    args = args.concat(getArgsFromOrderArray(order))
    args = args.concat(getArgsFromLimitType(limitType))

    funcArgs = funcArgs.concat(getFuncArgs(argsType, args, database, table))
    if (argsType === 'array' && fields.length === 0) {
      funcArgs = funcArgs.concat(getFuncArgs(argsType, updateArguments, database, table, 'updateArguments'))
    }

    let required = fields.map(item => convertNameWithPrefix(item, 'new'))
    required = required.concat(getRequiredParamsFromWhereAndLimit(where, limitType))
    const returnTemplate = getReturnTemplate(queryType, returnType, limitType)

    const vars = {
      funcArgs,
      args,
      argsType,
      required,
      returnTemplate,
      updateArguments
    }

    return renderMySpotDAO(queryName, queryType, database, table, vars)
  },
  delete (queryName, queryType, database, table, columns, fields, where, order, limitType, argsType, returnType) {
    return generalSelect(...arguments)
  }
}

/** Exports **/

export function generateMySpotSQL (database, table, queryType, columns, fields, where, order, limitType) {
  const code = queryGenerators[queryType](...arguments) || ''
  const sqlTemplate = code.replace(/\r?\n+/g, `\n`)
  const sqlTemplateInline = code.replace(/\r?\n+/g, '')
  const mixedSql = `# Expanded SQL Template \n\n${sqlTemplate}\n\n\n# Single Line SQL Template\n\n${sqlTemplateInline}`
  return {sqlTemplate, sqlTemplateInline, mixedSql}
}

export function generateMySpotConfig (database, table, queryType, fields, where, returnType, sqlTemplate) {
  const filename = getConfigurationFilename(database, table)
  const configTemplateName = getConfigTemplateName(database, table)
  const joinedFields = fields.map(item => ucfirst(underscoreToCamelCase(item))).join('')
  const whereFields = where.map(item => {
    let result = ucfirst(underscoreToCamelCase(item.name))
    if (item.type !== 'PLAIN') {
      return ucfirst(item.type.toLowerCase()) + result
    }
    return result
  }).join('')
  const queryName = queryType + joinedFields + (whereFields.length > 0 ? 'By' + whereFields : '')
  const dataObjectName = getDataObjectFullName(database, table)
  const configs = [{queryType, queryName, sqlTemplate, returnType, dataObjectName}]
  const vars = {
    configs,
    filename
  }
  const render = getTemplateRender('/template/MySpot/MySpotConfiguration.dot')
  const configTemplate = render(vars)
  const configTemplateItem = configTemplate.match(/('\S+'\s*=>\s*\[[\s\S]+\])[\s\S]*];/m)[1]
  return {configTemplate, configTemplateItem, queryName, configTemplateName, filename}
}

export function generateDAOCode (queryName, queryType, database, table, columns, fields, where, order, limitType, argsType, returnType) {
  const code = daoGenerations[queryType](...arguments)
  const daoMethodCode = code.match(/\{\s+( {4}\/[\s\S]+public function[\s\S]+\})\s+\}$/m)[1]
  return {code, daoMethodCode}
}

export function generateBaseDAOTemplate () {
  const render = getTemplateRender('/template/MySpot/BaseDAOFragments.dot')
  const namespace = getBaseDAONamespace()
  const shortName = getBaseDAOShortName()
  const filename = getBaseDAOFilename()
  const code = render({
    namespace, shortName
  })

  return {code, namespace, shortName, filename}
}

export function getBaseDAOMeta () {
  const namespace = getBaseDAONamespace()
  const shortName = getBaseDAOShortName()
  const filename = getBaseDAOFilename()
  return {
    namespace, shortName, filename
  }
}

export function getQueryMeta (database, queries) {
  return queries.map(query => {
    return {
      configurationFilename: getConfigurationFilename(database, query.table),
      daoFilename: getDAOFilename(database, query.table),
      ...query
    }
  })
}
