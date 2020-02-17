import fs from 'fs'
import path from 'path'

import doT from 'dot'

import store from '../store'

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

const convertSQLTypeToPDOType = (sqlType) => {
  if (/(?:BOOL)/i.test(sqlType)) {
    return 'SqlMapConst::PARAM_BOOL'
  } else if (/(?:INT)/i.test(sqlType)) {
    return 'SqlMapConst::PARAM_INT'
  } else {
    return 'SqlMapConst::PARAM_STR'
  }
}

const convertNameWithPrefix = (name, prefix) => prefix ? prefix + ucfirst(underscoreToCamelCase(name)) : underscoreToCamelCase(name)

const getDAOClassName = table => ucfirst(underscoreToCamelCase(table)) + 'DAO'

const getExampleConfigFilename = (database, table, suffix = '.php') => {
  return 'config/myspot/' + database + '/' + table + suffix
}

const getOptionalName = (prefix, variableName) => {
  return prefix + ucfirst(underscoreToCamelCase(variableName))
}

const getBaseNamespace = () => {
  return 'MyProject\\'
}

const getDataObjectFullName = (database, table) => {
  return '\\' + getBaseNamespace() + 'DataObject\\' + ucfirst(underscoreToCamelCase(database)) + '\\' + ucfirst(underscoreToCamelCase(table)) + 'DO'
}

const getBaseDAOName = () => {
  return getBaseNamespace() + 'DAO\\BaseDAO'
}

const getBaseDAONamespace = (database) => {
  return getBaseNamespace() + 'DAO'
}

const getDAONamespace = (database) => {
  return getBaseNamespace() + 'DAO\\' + ucfirst(underscoreToCamelCase(database))
}

const getDataObjectShortName = (database, table) => {
  return ucfirst(underscoreToCamelCase(table)) + 'DO'
}

const getConfigTemplateName = (database, table) => database + '.' + table

const getConfigTemplateNameWithQueryName = (database, table, queryName) => database + '.' + table + '.' + queryName

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

export default {
  install (Vue, options) {
    // do nothing
    doT.templateSettings.strip = false

    let dotBridge = {}

    const queryGenerations = {
      select (queryType, database, table, columns, fields, where, order, limitType, returnType) {
        let template = fs.readFileSync(path.join(__static, '/template/MySpot/SELECT.dot'), 'utf8')
        const render = doT.template(template)
        where = generateWhereTemplateVars(where)
        order = generateOrderByTemplateVars(order)
        const vars = {
          database, table, columns, fields, where, order, limit: processLimit(limitType), limitType
        }
        return render(vars)
      },
      selectCount (queryType, database, table, columns, fields, where, order, limitType, returnType) {
        let template = fs.readFileSync(path.join(__static, '/template/MySpot/SELECT_COUNT.dot'), 'utf8')
        const render = doT.template(template)
        where = generateWhereTemplateVars(where)
        const vars = {database, table, fields, where}
        return render(vars)
      },
      insert (queryType, database, table, columns, fields, where, order, limitType, returnType) {
        let template = fs.readFileSync(path.join(__static, '/template/MySpot/INSERT.dot'), 'utf8')
        const render = doT.template(template)
        const params = fields.map(item => underscoreToCamelCase(item))
        const vars = {database, table, fields, params}
        return render(vars)
      },
      update (queryType, database, table, columns, fields, where, order, limitType, returnType) {
        let template = fs.readFileSync(path.join(__static, '/template/MySpot/UPDATE.dot'), 'utf8')
        const render = doT.template(template)
        where = generateWhereTemplateVars(where)
        order = generateOrderByTemplateVars(order)
        const params = fields.map(item => 'new' + ucfirst(underscoreToCamelCase(item)))
        const vars = {
          database, table, columns, fields, params, where, order, limit: processLimit(limitType)
        }
        return render(vars)
      },
      delete (queryType, database, table, columns, fields, where, order, limitType, returnType) {
        let template = fs.readFileSync(path.join(__static, '/template/MySpot/DELETE.dot'), 'utf8')
        const render = doT.template(template)
        where = generateWhereTemplateVars(where)
        order = generateOrderByTemplateVars(order)
        const vars = {
          database, table, fields, where, order, limit: processLimit(limitType)
        }
        return render(vars)
      }
    }

    const daoTemplate = fs.readFileSync(path.join(__static, '/template/MySpot/DAOFragments.dot'), 'utf8')
    const dotRender = doT.template(daoTemplate)

    const generalSelect = (render, queryName, queryType, database, table, columns, fields, where, order, limitType, argsType, returnType) => {
      const className = getDAOClassName(table)
      const methodName = queryType
      let args = getArgsFromWhereArray(where, columns)
      args = args.concat(getArgsFromOrderArray(order))
      args = args.concat(getArgsFromLimitType(limitType))
      const funcArgs = getFuncArgs(argsType, args)
      let required = getRequiredParamsFromWhereAndLimit(where, limitType)
      const returnTemplate = getReturnTemplate(queryType, returnType, limitType, getDataObjectFullName(database, table))
      const vars = {
        className,
        queryName,
        queryType,
        database,
        table,
        funcArgs,
        args,
        limit: limitType,
        argsType,
        required,
        methodName,
        returnTemplate,
        fullQueryName: getConfigTemplateNameWithQueryName(database, table, queryName),
        daoNamespace: getDAONamespace(database),
        baseDAOName: getBaseDAOName()
      }
      return render(vars)
    }

    const daoGenerations = {
      select (queryName, queryType, database, table, columns, fields, where, order, limitType, argsType, returnType) {
        return generalSelect(dotRender, ...arguments)
      },
      selectCount (queryName, queryType, database, table, columns, fields, where, order, limitType, argsType, returnType) {
        const className = getDAOClassName(table)
        const methodName = 'select'
        let args = getArgsFromWhereArray(where, columns)
        let required = []
        limitType = 'limitOne'
        const funcArgs = getFuncArgs(argsType, args)
        const returnTemplate = getReturnTemplate(queryType, returnType, limitType)
        const vars = {
          className,
          queryName,
          queryType,
          database,
          table,
          funcArgs,
          args,
          limitType,
          argsType,
          required,
          methodName,
          returnTemplate,
          fullQueryName: getConfigTemplateNameWithQueryName(database, table, queryName),
          daoNamespace: getDAONamespace(database),
          baseDAOName: getBaseDAOName()
        }
        return dotRender(vars)
      },
      insert (queryName, queryType, database, table, columns, fields, where, order, limitType, argsType, returnType) {
        const className = getDAOClassName(table)
        const methodName = 'insert'
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
          className,
          queryName,
          queryType,
          database,
          table,
          funcArgs,
          args,
          limitType,
          argsType,
          required,
          methodName,
          returnTemplate,
          fullQueryName: getConfigTemplateNameWithQueryName(database, table, queryName),
          daoNamespace: getDAONamespace(database),
          baseDAOName: getBaseDAOName()
        }
        return dotRender(vars)
      },
      update (queryName, queryType, database, table, columns, fields, where, order, limitType, argsType, returnType) {
        const className = getDAOClassName(table)
        const methodName = 'update'

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
          className,
          queryName,
          queryType,
          database,
          table,
          funcArgs,
          args,
          limitType,
          argsType,
          required,
          methodName,
          returnTemplate,
          fullQueryName: getConfigTemplateNameWithQueryName(database, table, queryName),
          updateArguments,
          daoNamespace: getDAONamespace(database),
          baseDAOName: getBaseDAOName()
        }

        return dotRender(vars)
      },
      delete (queryName, queryType, database, table, columns, fields, where, order, limitType, argsType, returnType) {
        return generalSelect(dotRender, ...arguments)
      }
    }

    const generateBaseDAOTemplate = () => {
      let template = fs.readFileSync(path.join(__static, '/template/MySpot/BaseDAOFragments.dot'), 'utf8')
      const render = doT.template(template)
      return render({baseDAONamespace: getBaseDAONamespace()})
    }

    dotBridge = {
      generatePHPDataObject (database, tableName, fetchedColumns) {
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
          className: getDataObjectShortName(database, tableName),
          columns: columns,
          database: ucfirst(underscoreToCamelCase(database))
        }
        const code = render(vars)
        store.dispatch('generateDataObjectCode', code)
      },
      generateMySpotSQL (queryType, database, table, columns, fields, where, order, limitType, argsType, returnType) {
        const code = queryGenerations[queryType](...arguments)
        const sqlTemplate = code.replace(/\r?\n+/g, `\n`)
        const sqlTemplateInline = code.replace(/\r?\n+/g, '')
        const {configTemplate, configTemplateItem, queryName} = dotBridge.generateConfig(...arguments, sqlTemplateInline)
        const mixedSql = `# Expanded SQL Template \n\n${sqlTemplate}\n\n\n# Single Line SQL Template\n\n${sqlTemplateInline}`
        store.dispatch('generateSQLTemplate', {
          sqlTemplate,
          sqlTemplateInline,
          mixedSql,
          configTemplate,
          configTemplateItem,
          queryName
        })
        dotBridge.generateDaoCode(queryName, ...arguments)
      },
      generateConfig (queryType, database, table, columns, fields, where, order, limitType, argsType, returnType, code) {
        const exampleFilename = getExampleConfigFilename(database, table)
        const configTemplateName = getConfigTemplateName(database, table)
        const joinedFields = fields.map(item => ucfirst(underscoreToCamelCase(item))).join('')
        const whereFields = where.map(item => ucfirst(underscoreToCamelCase(item.name))).join('')
        const queryName = queryType + joinedFields + (whereFields.length > 0 ? 'By' + whereFields : '')
        const vars = {
          queryType,
          exampleFilename,
          queryName,
          sqlTemplate: code,
          returnType,
          dataObjectName: getDataObjectFullName(database, table)
        }
        let template = fs.readFileSync(path.join(__static, '/template/MySpot/MySpotConfiguration.dot'), 'utf8')
        const render = doT.template(template)
        const configTemplate = render(vars)
        const configTemplateItem = configTemplate.match(/('\S+'\s*=>\s*\[[\s\S]+\])[\s\S]*,/m)[1]
        return {configTemplate, configTemplateItem, queryName, configTemplateName}
      },
      generateDaoCode (queryName, queryType, database, table, columns, fields, where, order, limitType, argsType, returnType) {
        const code = daoGenerations[queryType](...arguments)
        const baseDAOCode = generateBaseDAOTemplate()
        const daoMethodCode = code.match(/\{\s+( {4}\/[\s\S]+public function[\s\S]+\})\s+\}$/m)[1]
        store.dispatch('generateDaoCode', {code, baseDAOCode, daoMethodCode})
      }
    }
    Vue.prototype.$dot = dotBridge
  }
}
