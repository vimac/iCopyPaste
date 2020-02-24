<template>
  <Content id="queryContent">
    <Form :label-width="90">
      <FormItem label="Operation">
        <Button size="small" type="primary" @click="addToProject">
          <Icon type="ios-add"/>
          Add To Project
        </Button>
      </FormItem>
      <FormItem label="Type">
        <RadioGroup v-model="queryType" size="small" type="button">
          <Radio label="select">SELECT</Radio>
          <Radio label="selectCount">SELECT COUNT</Radio>
          <Radio label="insert">INSERT</Radio>
          <Radio label="update">UPDATE</Radio>
          <Radio label="delete">DELETE</Radio>
        </RadioGroup>
      </FormItem>
      <div v-if="columns.length">
        <FormItem label="Field">
          <CheckboxGroup v-model="fields" size="small">
            <Checkbox v-for="{name} in columns" :key="name" :label="name" :disabled="disableField">{{name}}</Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem label="Where">
          <CheckboxGroup v-model="whereFields" size="small">
            <Checkbox v-for="{name} in columns" :key="name" :label="name" :disabled="disableWhere">{{name}}
            </Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem v-if="whereFields.length > 0">
          <Table :show-header='false' :data="where" :columns="whereTable" size="small"/>
        </FormItem>
        <FormItem label="Order">
          <CheckboxGroup v-model="orderFields" size="small">
            <Checkbox v-for="{name} in columns" :key="name" :label="name" :disabled="disableOrder">{{name}}
            </Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem v-if="orderFields.length > 0">
          <Table :show-header='false' :data="order" :columns="orderTable" size="small"/>
        </FormItem>
      </div>
      <div v-else>
        loading
      </div>
      <FormItem label="Limit">
        <RadioGroup size="small" v-model="limitType">
          <Radio label="no" :disabled="disableLimit">NO LIMIT</Radio>
          <Radio label="limitOne" :disabled="disableLimit">LIMIT 1</Radio>
          <Radio label="limitRows" :disabled="disableLimit">LIMIT ?</Radio>
          <Radio label="limitOffsetRows" :disabled="disableLimit">LIMIT ?, ?</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="Arguments">
        <RadioGroup size="small" v-model="argsType">
          <Radio label="plain">Plain</Radio>
          <Radio label="array">Array</Radio>
          <Radio label="do" :disabled="disableDataObjectType">DataObject</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="ReturnType">
        <RadioGroup size="small" v-model="returnType">
          <Radio label="sqlMapResult" :disabled="disableReturnType.indexOf('sqlMapResult') > -1">SQLMapResult</Radio>
          <Radio label="do" :disabled="disableReturnType.indexOf('do') > -1">DataObject</Radio>
          <Radio label="stdClass" :disabled="disableReturnType.indexOf('stdClass') > -1">StdClass</Radio>
          <Radio label="onlyValue" :disabled="disableReturnType.indexOf('onlyValue') > -1">Only value</Radio>
          <Radio label="array" :disabled="disableReturnType.indexOf('array') > -1">Array</Radio>
          <Radio label="lines" :disabled="disableReturnType.indexOf('lines') > -1">Affect lines</Radio>
          <Radio label="lastInsertId" :disabled="disableReturnType.indexOf('lastInsertId') > -1">Last ID</Radio>
        </RadioGroup>
      </FormItem>
    </Form>
    <div>
      <!--      <Tabs ref="tab">-->
      <!--        <TabPane label="SQL Template" class="codeTab">-->
      <!--          <ButtonGroup class="copyCode">-->
      <!--            <Button @click="onCopyExpanded" size="small" icon="ios-copy-outline">Expanded</Button>-->
      <!--            <Button @click="onCopySingleLine" size="small" icon="ios-copy-outline">Single line</Button>-->
      <!--          </ButtonGroup>-->
      <!--          <CodeFileContent language="sql"-->
      <!--                           fileType="sql"-->
      <!--                           :database="config.database"-->
      <!--                           :table="table"-->
      <!--                           :params="{queryType, columns, fields, where, order, limitType}"-->
      <!--                           @on-loaded="onSqlTemplateLoaded"-->
      <!--          />-->
      <!--        </TabPane>-->
      <!--        <TabPane label="Config" class="codeTab">-->
      <!--          <ButtonGroup class="copyCode">-->
      <!--            <Button @click="onCopyConfig" size="small" icon="ios-copy-outline">Whole file</Button>-->
      <!--            <Button @click="onCopyConfigItem" size="small" icon="ios-copy-outline">Single item</Button>-->
      <!--          </ButtonGroup>-->
      <!--          <CodeFileContent language="sql"-->
      <!--                           fileType="sql"-->
      <!--                           :database="config.database"-->
      <!--                           :table="table"-->
      <!--                           :params="{queryType, columns, fields, where, order, limitType}"-->
      <!--                           @on-loaded="onSqlTemplateLoaded"-->
      <!--          />-->
      <!--        </TabPane>-->
      <!--        <TabPane label="DAO" class="codeTab">-->
      <!--          <ButtonGroup class="copyCode">-->
      <!--            <Button @click="onCopyDAO" size="small" icon="ios-copy-outline">Class</Button>-->
      <!--            <Button @click="onCopyDAOMethod" size="small" icon="ios-copy-outline">Method</Button>-->
      <!--          </ButtonGroup>-->
      <!--          <CodeFileContent language="php"-->
      <!--                           fileType="myspotDAO"-->
      <!--                           :database="config.database"-->
      <!--                           :table="table"-->
      <!--                           :params="{queryName, queryType, columns, fields, where, order, limitType, argsType, returnType}"-->
      <!--          />-->

      <!--        </TabPane>-->
      <!--        <TabPane label="BaseDAO" class="codeTab">-->
      <!--          <ButtonGroup class="copyCode">-->
      <!--            <Button @click="onCopyBaseDAO" size="small" icon="ios-copy-outline">BaseDAO</Button>-->
      <!--          </ButtonGroup>-->
      <!--          <CodeFileContent language="php"-->
      <!--                           fileType="myspotBaseDAO"-->
      <!--                           :params="{}"-->
      <!--          />-->
      <!--        </TabPane>-->
      <!--      </Tabs>-->
      <MySpotQueryCodes :database="config.database" :table="table" :params="mySpotQueryCodeParams"
                        @on-updated-configuration="onUpdatedConfiguration"/>
    </div>
  </Content>
</template>

<script>
  import {mapActions, mapState} from 'vuex'
  import CodeFileContent from '../Widget/CodeFileContent'
  import MySpotQueryCodes from '../Widget/MySpotQueryCodes'

  const equal = require('deep-equal')

  export default {
    name: 'QueryForm',
    components: {
      MySpotQueryCodes,
      CodeFileContent
    },
    computed: {
      ...mapState({
        configTemplate: state => state.code.configTemplate,
        configTemplateItem: state => state.code.configTemplateItem,
        daoCode: state => state.code.daoCode,
        daoMethodCode: state => state.code.daoMethodCode,
        baseDAOCode: state => state.code.baseDAOCode,
        config: state => state.db.config,
        query: state => state.query
      }),
      table () {
        return this.$route.params.table
      },
      whereFields: {
        get () {
          return this.where.map(item => item.name)
        },
        set (newWhere) {
          let map = {}
          let result = this.where.filter(value => {
            if (!newWhere.includes(value.name)) {
              return false
            }
            map[value.name] = value.type
            return true
          })
          newWhere.forEach(value => {
            if (!map[value]) {
              result.push({name: value, type: 'PLAIN', optional: false})
            }
          })
          this.where = result
        }
      },
      orderFields: {
        get () {
          return this.order.map(item => item.name)
        },
        set (newOrder) {
          let map = {}
          let result = this.order.filter(value => {
            if (!newOrder.includes(value.name)) {
              return false
            }
            map[value.name] = value.type
            return true
          })
          newOrder.forEach(value => {
            if (!map[value]) {
              result.push({name: value, type: 'ASC', optional: false})
            }
          })
          this.order = result
        }
      },
      mySpotQueryCodeParams () {
        return {
          queryType: this.queryType,
          columns: this.columns,
          fields: this.fields,
          where: this.where,
          order: this.order,
          limitType: this.limitType,
          argsType: this.argsType,
          returnType: this.returnType
        }
      }
    },
    methods: {
      ...(mapActions(['addQuery'])),
      onUpdatedConfiguration (code, payload) {
        const {queryName} = payload
        this.queryName = queryName
      },
      addToProject () {
        const q = {
          queryName: this.queryName,
          table: this.table,
          params: this.mySpotQueryCodeParams
        }
        if (this.query.queries.filter(item => equal(item, q)).length > 0) {
          this.$Message.destroy()
          this.$Message.error('Duplicated query')
          return
        }
        this.addQuery(q)
      },
      onCopyExpanded () {
        require('electron').clipboard.writeText(this.sqlTemplate)
        this.$Message.info('Expanded SQL template copied to clipboard')
      },
      onCopySingleLine () {
        require('electron').clipboard.writeText(this.sqlTemplateInline)
        this.$Message.info('Single line SQL template copied to clipboard')
      },
      onCopyConfig () {
        require('electron').clipboard.writeText(this.configTemplate)
        this.$Message.info('Configuration template copied to clipboard')
      },
      onCopyConfigItem () {
        require('electron').clipboard.writeText(this.configTemplateItem)
        this.$Message.info('Single configuration item copied to clipboard')
      },
      onCopyDAO () {
        require('electron').clipboard.writeText(this.daoCode)
        this.$Message.info('DAO class code copied to clipboard')
      },
      onCopyDAOMethod () {
        require('electron').clipboard.writeText(this.daoMethodCode)
        this.$Message.info('DAO method copied to clipboard')
      },
      onCopyBaseDAO () {
        require('electron').clipboard.writeText(this.baseDAOCode)
        this.$Message.info('BaseDAO code copied to clipboard')
      },
      loadColumns () {
        return new Promise((resolve, reject) => {
          this.$conn.fetchColumns(this.config.database, this.table)
            .then((fetchedColumns) => {
              this.columns = fetchedColumns
              resolve()
            })
            .catch(err => {
              this.$Message.error(err.message)
            })
        })
      }
    },
    mounted () {
      this.loadColumns()
    },
    watch: {
      queryType (newType, oldType) {
        this.disableField = false
        this.disableOrder = false
        this.disableWhere = false
        this.disableLimit = false
        this.disableDataObjectType = true
        this.disableReturnType = []
        this.argsType = this.argsType === 'do' ? 'plain' : this.argsType
        if (newType === 'insert') {
          this.disableWhere = true
          this.disableOrder = true
          this.disableLimit = true
          this.disableDataObjectType = false
          this.where = []
          this.order = []
          this.limitType = 'no'
          this.returnType = this.returnType === 'sqlMapResult' ? 'sqlMapResult' : 'lastInsertId'
          this.disableReturnType = ['do', 'array', 'stdClass', 'onlyValue']
        } else if (newType === 'delete') {
          this.disableField = true
          this.fields = []
          this.limitType = 'limitOne'
          this.returnType = this.returnType === 'sqlMapResult' ? 'sqlMapResult' : 'lines'
          this.disableReturnType = ['do', 'array', 'stdClass', 'lastInsertId', 'onlyValue']
        } else if (newType === 'update') {
          this.returnType = this.returnType === 'sqlMapResult' ? 'sqlMapResult' : 'lines'
          this.disableReturnType = ['do', 'array', 'stdClass', 'lastInsertId', 'onlyValue']
        } else if (newType === 'selectCount') {
          this.disableOrder = true
          this.disableLimit = true
          this.order = []
          this.limitType = 'no'
          this.returnType = this.returnType === 'sqlMapResult' ? 'sqlMapResult' : 'onlyValue'
          this.disableReturnType = ['do', 'stdClass', 'lines', 'lastInsertId']
        } else if (newType === 'select') {
          this.returnType = this.returnType === 'sqlMapResult' ? 'sqlMapResult' : 'do'
          this.disableReturnType = ['lines', 'lastInsertId']
        }
      },
      $route (to, from) {
        this.queryType = 'select'
        this.fields = []
        this.where = []
        this.order = []
        this.limitType = 'no'
      },
      table (to, from) {
        this.loadColumns()
      }
    },
    data () {
      return {
        sqlTemplate: '',
        sqlTemplateInline: '',
        queryName: '',
        queryType: 'select',
        argsType: 'plain',
        returnType: 'do',
        columns: [],
        fields: [],
        selectedField: [],
        where: [],
        whereTable: [
          {
            key: 'name',
            render: (h, params) => {
              const self = this
              return h('div', [h('Button', {
                props: {
                  size: 'small',
                  type: 'text',
                  shape: 'circle',
                  icon: 'ios-trash'
                },
                on: {
                  'click' () {
                    self.where = self.where.filter(item => item.name !== params.row.name)
                  }
                }
              }), ' ' + params.row.name])
            }
          },
          {
            key: 'type',
            width: 180,
            render: (h, params) => {
              const self = this
              return h('RadioGroup',
                {
                  props: {
                    size: 'small',
                    value: params.row.type,
                    type: 'button'
                  },
                  on: {
                    'on-change' (val) {
                      let idx
                      self.where.forEach((item, i) => {
                        if (params.row.name === item.name) idx = i
                      })
                      self.where[idx].type = val
                    }
                  }
                },
                [
                  h('Radio',
                    {props: {label: 'PLAIN'}}, '= ?'
                  ),
                  h('Radio',
                    {props: {label: 'LIKE'}}, 'LIKE ?'
                  ),
                  h('Radio',
                    {props: {label: 'IN'}}, 'IN (?,...)'
                  )
                ]
              )
            }
          },
          {
            key: 'option',
            width: 85,
            render: (h, params) => {
              const self = this
              return h('Checkbox', {
                props: {
                  size: 'small',
                  value: params.row.optional
                },
                on: {
                  'on-change' (val) {
                    let idx
                    self.where.forEach((item, i) => {
                      if (params.row.name === item.name) idx = i
                    })
                    self.where[idx].optional = val
                  }
                }
              }, 'Optional')
            }
          }
        ],
        order: [],
        orderTable: [
          {
            key: 'name',
            render: (h, params) => {
              const self = this
              return h('div', [h('Button', {
                props: {
                  size: 'small',
                  type: 'text',
                  shape: 'circle',
                  icon: 'ios-trash'
                },
                on: {
                  'click' () {
                    self.order = self.order.filter(item => item.name !== params.row.name)
                  }
                }
              }), ' ' + params.row.name])
            }
          },
          {
            key: 'type',
            width: 125,
            render: (h, params) => {
              const self = this
              return h('RadioGroup',
                {
                  props: {
                    size: 'small',
                    value: params.row.type,
                    type: 'button'
                  },
                  on: {
                    'on-change' (val) {
                      let idx
                      self.order.forEach((item, i) => {
                        if (params.row.name === item.name) idx = i
                      })
                      self.order[idx].type = val
                    }
                  }
                },
                [
                  h('Radio',
                    {props: {label: 'ASC'}}, 'ASC'
                  ),
                  h('Radio',
                    {props: {label: 'DESC'}}, 'DESC'
                  )
                ]
              )
            }
          },
          {
            key: 'option',
            width: 85,
            render: (h, params) => {
              const self = this
              return h('Checkbox', {
                props: {
                  size: 'small',
                  value: params.row.optional
                },
                on: {
                  'on-change' (val) {
                    let idx
                    self.order.forEach((item, i) => {
                      if (params.row.name === item.name) idx = i
                    })
                    self.order[idx].optional = val
                  }
                }
              }, 'Optional')
            }
          }
        ],
        limitType: 'no',
        disableField: false,
        disableWhere: false,
        disableOrder: false,
        disableLimit: false,
        disableDataObjectType: true,
        disableReturnType: ['lines', 'lastInsertId']
      }
    }
  }
</script>

<style scoped>
  .ivu-form-item {
    margin-bottom: 4px;
  }

  .ivu-table-cell {
    padding-left: 4px;
    padding-right: 4px;
  }

  /*.codeTab {*/
  /*  position: relative;*/
  /*}*/

  /*.copyCode {*/
  /*  position: absolute;*/
  /*  right: 10px;*/
  /*  top: 14px;*/
  /*  z-index: 10000;*/
  /*}*/

</style>
