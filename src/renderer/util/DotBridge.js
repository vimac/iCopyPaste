import fs from 'fs'
import path from 'path'

import doT from 'dot'

import store from '../store'

const underscoreToCamelCase = str => str.replace(/_([a-z])/g, x => x[1].toUpperCase())
const ucfirst = str => str.replace(/^./, x => x[0].toUpperCase())

const convertSQLTypeToNative = (type) => {
  if (/(?:BOOL)/i.test(type)) {
    return 'bool'
  } else if (/(?:INT)/i.test(type)) {
    return 'int'
  } else if (/(?:DOUBLE)|(?:FLOAT)/i.test(type)) {
    return 'float'
  } else {
    return 'string'
  }
}

const convertSQLTypeToPDOType = (type) => {
  if (/(?:BOOL)/i.test(type)) {
    return 'SqlMapConst::PARAM_BOOL'
  } else if (/(?:INT)/i.test(type)) {
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

const getDataObjectFullName = (database, table) => {
  return 'MyProject\\DataObject\\' + ucfirst(underscoreToCamelCase(database)) + '\\' + ucfirst(underscoreToCamelCase(table)) + 'DO'
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
      phpType: convertSQLTypeToNative(columnType),
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
  if (limitType === 'LIMIT_ROWS') {
    args.push({
      name: 'limitRows',
      keyName: 'limitRows',
      phpType: 'int',
      pdoType: convertSQLTypeToNative('INT'),
      condition: false
    })
  } else if (limitType === 'LIMIT_OFFSET_ROWS') {
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

  if (limitType === 'LIMIT_ROWS') {
    required.push('limitRows')
  } else if (limitType === 'LIMIT_OFFSET_ROWS') {
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
    funcArgs.push({name: 'sourceObject', type: '\\' + getDataObjectFullName(database, table), condition: false})
  }
  return funcArgs
}

const processLimit = (limitType) => {
  switch (limitType) {
    case 'NO':
      return ''
    case 'LIMIT_ONE':
      return 'LIMIT 1'
    case 'LIMIT_ROWS':
      return 'LIMIT :limitRows'
    case 'LIMIT_OFFSET_ROWS':
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

export default {
  install (Vue, options) {
    // do nothing
    doT.templateSettings.strip = false

    let dotBridge = {}

    const queryGenerations = {
      select (type, database, table, columns, fields, where, order, limitType) {
        let template = fs.readFileSync(path.join(__static, '/template/MySpot/SELECT.dot'), 'utf8')
        const render = doT.template(template)
        where = generateWhereTemplateVars(where)
        order = generateOrderByTemplateVars(order)
        const vars = {
          database, table, columns, fields, where, order, limit: processLimit(limitType), limitType
        }
        return render(vars)
      },
      selectCount (type, database, table, columns, fields, where, order, limitType) {
        let template = fs.readFileSync(path.join(__static, '/template/MySpot/SELECT_COUNT.dot'), 'utf8')
        const render = doT.template(template)
        where = generateWhereTemplateVars(where)
        const vars = {database, table, fields, where}
        return render(vars)
      },
      insert (type, database, table, columns, fields, where, order, limitType) {
        let template = fs.readFileSync(path.join(__static, '/template/MySpot/INSERT.dot'), 'utf8')
        const render = doT.template(template)
        const params = fields.map(item => underscoreToCamelCase(item))
        const vars = {database, table, fields, params}
        return render(vars)
      },
      update (type, database, table, columns, fields, where, order, limitType) {
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
      delete (type, database, table, columns, fields, where, order, limitType) {
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

    const generalSelect = (render, queryName, type, database, table, columns, fields, where, order, limitType, argsType) => {
      const className = getDAOClassName(table)
      const methodName = type
      let args = getArgsFromWhereArray(where, columns)
      args = args.concat(getArgsFromOrderArray(order))
      args = args.concat(getArgsFromLimitType(limitType))
      const funcArgs = getFuncArgs(argsType, args)
      let required = getRequiredParamsFromWhereAndLimit(where, limitType)
      const vars = {
        className,
        queryName,
        type,
        database,
        table,
        funcArgs,
        args,
        limit: limitType,
        argsType,
        required,
        methodName,
        returnType: {type: getDataObjectFullName(database, table), comment: 'Data Object'},
        fullQueryName: getConfigTemplateNameWithQueryName(database, table, queryName)
      }
      return render(vars)
    }

    const daoGenerations = {
      select (queryName, type, database, table, columns, fields, where, order, limitType, argsType) {
        return generalSelect(dotRender, ...arguments)
      },
      selectCount (queryName, type, database, table, columns, fields, where, order, limitType, argsType) {
        const className = getDAOClassName(table)
        const methodName = 'select'
        let args = getArgsFromWhereArray(where, columns)
        let required = []
        limitType = 'LIMIT_ONE'
        const funcArgs = getFuncArgs(argsType, args)
        const vars = {
          className,
          queryName,
          type,
          database,
          table,
          funcArgs,
          args,
          limitType,
          argsType,
          required,
          methodName,
          returnType: {type: 'int', comment: 'Counted lines'},
          fullQueryName: getConfigTemplateNameWithQueryName(database, table, queryName)
        }
        return dotRender(vars)
      },
      insert (queryName, type, database, table, columns, fields, where, order, limitType, argsType) {
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
        limitType = 'LIMIT_ONE'
        const funcArgs = getFuncArgs(argsType, args, database, table)
        const vars = {
          className,
          queryName,
          type,
          database,
          table,
          funcArgs,
          args,
          limitType,
          argsType,
          required,
          methodName,
          returnType: {type: 'int', comment: 'Last insert ID'},
          fullQueryName: getConfigTemplateNameWithQueryName(database, table, queryName)
        }
        return dotRender(vars)
      },
      update (queryName, type, database, table, columns, fields, where, order, limitType, argsType) {
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

        const vars = {
          className,
          queryName,
          type,
          database,
          table,
          funcArgs,
          args,
          limitType,
          argsType,
          required,
          methodName,
          returnType: {type: 'int', comment: 'Affected lines'},
          fullQueryName: getConfigTemplateNameWithQueryName(database, table, queryName),
          updateArguments
        }

        return dotRender(vars)
      },
      delete (queryName, type, database, table, columns, fields, where, order, limitType, argsType) {
        return generalSelect(dotRender, ...arguments)
      }
    }

    const generateBaseDAOTemplate = () => {
      let template = fs.readFileSync(path.join(__static, '/template/MySpot/BaseDAOFragments.dot'), 'utf8')
      const render = doT.template(template)
      return render({})
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
      generateMySpotSQL (type, database, table, columns, fields, where, order, limitType, argsType) {
        const code = queryGenerations[type](...arguments)
        const sqlTemplateInline = code.replace(/\r?\n+/g, '')
        const {configTemplate, queryName} = dotBridge.generateConfig(...arguments, sqlTemplateInline)
        store.dispatch('generateSQLTemplate', {
          sqlTemplate: code.replace(/\r?\n+/g, `\n`),
          sqlTemplateInline,
          configTemplate,
          queryName
        })
        dotBridge.generateDaoCode(queryName, ...arguments)
      },
      generateConfig (type, database, table, columns, fields, where, order, limitType, argsType, code) {
        const exampleFilename = getExampleConfigFilename(database, table)
        const configTemplateName = getConfigTemplateName(database, table)
        const joinedFields = fields.map(item => ucfirst(underscoreToCamelCase(item))).join('')
        const whereFields = where.map(item => ucfirst(underscoreToCamelCase(item.name))).join('')
        const queryName = type + joinedFields + (whereFields.length > 0 ? 'By' + whereFields : '')
        const vars = {
          type,
          exampleFilename,
          queryName,
          sqlTemplate: code,
          dataObjectName: getDataObjectFullName(database, table)
        }
        let template = fs.readFileSync(path.join(__static, '/template/MySpot/MySpotConfiguration.dot'), 'utf8')
        const render = doT.template(template)
        let configTemplate = render(vars)
        return {configTemplate, queryName, configTemplateName}
      },
      generateDaoCode (queryName, type, database, table, columns, fields, where, order, limitType, argsType) {
        const code = daoGenerations[type](...arguments)
        const baseDAOCode = generateBaseDAOTemplate()
        store.dispatch('generateDaoCode', {code, baseDAOCode})
      }
    }
    Vue.prototype.$dot = dotBridge
  }
}
