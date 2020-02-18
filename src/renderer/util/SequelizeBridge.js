import store from '../store'
import Sequelize from 'sequelize'

export default {
  install (Vue, options) {
    let sequelize
    store.subscribe((mutation, state) => {
      if (mutation.type === 'SUBMIT_CONFIG' && state.db.config.host !== undefined && state.db.config.host !== null) {
        const {database, host, port, user, pass} = state.db.config
        try {
          sequelize = null
          sequelize = new Sequelize(database, user, pass, {
            host: host,
            port: port,
            dialect: 'mysql'
          })
          sequelize.authenticate().then(() => {
            store.dispatch('submitConnectionStatus', {connected: 'succeed'})
            console.info('Connected')
            // endSubscribe()
          }).catch(err => {
            store.dispatch('submitConnectionStatus', {connected: 'error', errorMessage: err.message})
          })
        } catch (e) {
          console.error('Unexpected ', e)
        }
      }
    })
    Vue.prototype.$conn = {
      fetchTables (database) {
        if (!sequelize) {
          return
        }
        sequelize.query('SELECT `TABLE_NAME` as name, `TABLE_COMMENT` as comment FROM `INFORMATION_SCHEMA`.`TABLES` where `TABLE_SCHEMA` = $database', {
          bind: {database: database},
          type: sequelize.QueryTypes.SELECT
        }).then(tables => {
          store.dispatch('fetchedTables', tables)
        }).catch(err => {
          console.warn(err)
          sequelize.query('SHOW TABLES', {
            type: sequelize.QueryTypes.SELECT
          }).then(tables => {
            let fetched = []
            Object.keys(tables).forEach((key) => {
              fetched.push({
                'name': tables[key]['Tables_in_' + database]
              })
            })
            store.dispatch('fetchedTables', fetched)
          }).catch(err => {
            console.warn(err)
          })
        })
      },
      fetchColumns (database, table) {
        if (!sequelize) {
          return
        }
        sequelize.query(
          'SELECT `COLUMN_NAME` as name, `IS_NULLABLE` as nullable, `COLUMN_TYPE` as type, `COLUMN_KEY` as `key`, `COLUMN_COMMENT` as comment, `COLUMN_DEFAULT` as defaultValue, `EXTRA` as `extra` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA` = $database AND `TABLE_NAME` = $table ORDER BY `ORDINAL_POSITION` ASC'
          , {
            bind: {database: database, table: table},
            type: sequelize.QueryTypes.SELECT
          }
        ).then(columns => {
          let fetched = []
          Object.keys(columns).forEach(key => {
            let tgt = columns[key]
            tgt.extra = tgt.extra.toLowerCase()
            tgt.nullable = tgt.nullable !== 'NO'
            tgt.required = !tgt.nullable && tgt.defaultValue === null && tgt.extra !== 'auto_increment'
            fetched.push(tgt)
          })
          store.dispatch('fetchedColumns', fetched)
        }).catch(err => {
          console.warn(err)
        })
      },
      fetchTableDDL (database, table) {
        if (!sequelize) {
          return
        }
        sequelize.query(`SHOW CREATE TABLE \`${database}\`.\`${table}\``
          , {
            type: sequelize.QueryTypes.SELECT
          }
        ).then(
          (result) => {
            let ddl = ''
            const firstEl = result.shift()
            Object.keys(firstEl).forEach(key => {
              if (/create\s+table[\S\s]*\([\S\s]+\)/i.test(firstEl[key])) {
                ddl = firstEl[key]
              }
            })
            store.dispatch('fetchedDDL', ddl)
          }
        ).catch(
          err => {
            console.warn(err)
          }
        )
      }
    }
  }
}
