<template>
  <div>
    <Form :label-width="90">
      <FormItem label="Type">
        <RadioGroup v-model="type" size="small" type="button">
          <Radio label="select">SELECT</Radio>
          <Radio label="selectCount">SELECT COUNT</Radio>
          <Radio label="insert">INSERT</Radio>
          <Radio label="update">UPDATE</Radio>
          <Radio label="delete">DELETE</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="Field">
        <CheckboxGroup v-model="field" size="small">
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
      <FormItem label="Limit">
        <RadioGroup size="small" v-model="limit">
          <Radio label="NO" :disabled="disableLimit">NO LIMIT</Radio>
          <Radio label="LIMIT_ONE" :disabled="disableLimit">LIMIT 1</Radio>
          <Radio label="LIMIT_ROWS" :disabled="disableLimit">LIMIT ?</Radio>
          <Radio label="LIMIT_OFFSET_ROWS" :disabled="disableLimit">LIMIT ?, ?</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="Arguments">
        <RadioGroup size="small" v-model="argsType">
          <Radio label="plain">Plain</Radio>
          <Radio label="array">Array</Radio>
          <Radio label="do" :disabled="disableDataObjectType">DataObject</Radio>
        </RadioGroup>
      </FormItem>
    </Form>
    <Tabs>
      <TabPane label="SQL Template">
        <Button class="copyCode" @click="onCopyCode" size="small" icon="ios-copy-outline">Copy</Button>
        <CodeHighlight language="sql">
          {{mixedSql}}
        </CodeHighlight>
      </TabPane>
      <TabPane label="Config">
        <CodeHighlight language="php">
          {{configTemplate}}
        </CodeHighlight>
      </TabPane>
      <TabPane label="DAO">
        <CodeHighlight language="php">
          {{daoCode}}
        </CodeHighlight>
      </TabPane>
      <TabPane label="BaseDAO">
        <CodeHighlight language="php">
          {{baseDAOCode}}
        </CodeHighlight>
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import CodeHighlight from 'vue-code-highlight/src/CodeHighlight.vue'
  import 'prism-es6/components/prism-sql'
  import 'prism-es6/components/prism-markup-templating'
  import 'prism-es6/components/prism-php'

  export default {
    name: 'QueryForm',
    components: {
      CodeHighlight
    },
    props: {
      database: String,
      table: String,
      columns: Array
    },
    computed: {
      ...mapState({
        sqlTemplate: state => state.code.sqlTemplate,
        sqlTemplateInline: state => state.code.sqlTemplateInline,
        mixedSql: state => (`# Expanded SQL Template \n\n${state.code.sqlTemplate}\n\n\n# Single Line SQL Template\n\n${state.code.sqlTemplateInline}`),
        configTemplate: state => state.code.configTemplate,
        queryName: state => state.code.queryName,
        daoCode: state => state.code.daoCode,
        baseDAOCode: state => state.code.baseDAOCode
      }),
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
      }
    },
    methods: {
      generateSQL () {
        this.$dot.generateMySpotSQL(this.type, this.database, this.table, this.columns, this.field, this.where, this.order, this.limit, this.argsType)
      }
    },
    mounted () {
      this.generateSQL()
    },
    watch: {
      type (newType, oldType) {
        this.disableField = false
        this.disableOrder = false
        this.disableWhere = false
        this.disableLimit = false
        this.disableDataObjectType = true
        this.argsType = this.argsType === 'do' ? 'plain' : this.argsType
        if (newType === 'insert') {
          this.disableWhere = true
          this.disableOrder = true
          this.disableLimit = true
          this.disableDataObjectType = false
          this.where = []
          this.order = []
          this.limit = 'NO'
        } else if (newType === 'delete') {
          this.disableField = true
          this.field = []
          this.limit = 'LIMIT_ONE'
        } else if (newType === 'selectCount') {
          this.disableOrder = true
          this.disableLimit = true
          this.order = []
          this.limit = 'NO'
        }
        this.generateSQL()
      },
      $route (to, from) {
        this.type = 'select'
        this.field = []
        this.where = []
        this.order = []
        this.limit = 'NO'
      },
      ...(() => {
        let x = {
          handler (newX, oldX) {
            this.generateSQL()
          },
          deep: true
        }
        return {where: x, order: x, field: x, limit: x, argsType: x}
      })()
    },
    data () {
      return {
        type: 'select',
        argsType: 'plain',
        field: [],
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
        limit: 'NO',
        disableField: false,
        disableWhere: false,
        disableOrder: false,
        disableLimit: false,
        disableDataObjectType: true
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

  .copyCode {
    position: absolute;
    right: 10px;
    top: 15px;
    z-index: 10000;
  }

</style>
