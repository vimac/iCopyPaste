<template>
  <div>
    <Spin v-if="spinLoading">
      <Icon type="ios-loading" size=80 class="spinLoading"></Icon>
    </Spin>
    <CodeHighlight v-else :language="language">{{code}}</CodeHighlight>
  </div>
</template>

<script>
  import CodeHighlight from 'vue-code-highlight/src/CodeHighlight.vue'

  import {
    generateBaseDAOTemplate,
    generateDAOCode,
    generateMySpotConfig,
    generateMySpotSQL
  } from '../../generator/MySpotGenerator'

  export default {
    name: 'CodeFileContent',
    components: {CodeHighlight},
    props: {
      database: String,
      table: String,
      language: String,
      fileType: String,
      params: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data () {
      return {
        spinLoading: false,
        code: ''
      }
    },
    watch: {
      table (newTable, old) {
        this.refreshCode()
      },
      params: {
        handler (newParams, old) {
          this.refreshCode()
        },
        deep: true
      }
    },
    mounted () {
      this.refreshCode()
    },
    methods: {
      refreshCode () {
        const errHandler = (err) => {
          this.spinLoading = false
          this.$Message.error(err.message)
        }
        switch (this.fileType) {
          case 'ddl':
            this.spinLoading = true
            this.$conn.fetchTableDDL(this.database, this.table)
              .then(code => {
                this.spinLoading = false
                this.code = code
                this.$emit('on-loaded', code, {})
              })
              .catch(errHandler)
            break
          case 'dataModel':
            this.spinLoading = true
            this.$conn.fetchColumns(this.database, this.table)
              .then((fetchedColumns) => {
                const code = this.$modelGenerator.getDataModelByTable('myspot', this.database, this.table, fetchedColumns)
                this.spinLoading = false
                this.code = code
                this.$emit('on-loaded', code, {fetchedColumns})
              })
              .catch(errHandler)
            break
          case 'sql': {
            const {queryType, columns, fields, where, order, limitType} = this.params
            if (columns.length > 0) {
              const {sqlTemplate, sqlTemplateInline, mixedSql} = generateMySpotSQL(this.database, this.table, queryType, columns, fields, where, order, limitType)
              this.code = mixedSql
              this.$emit('on-loaded', mixedSql, {sqlTemplate, sqlTemplateInline})
            }
            break
          }
          case 'mySpotConfiguration': {
            const {queryType, columns, fields, where, returnType, sqlTemplateInline} = this.params
            if (columns.length > 0) {
              const {configTemplate, configTemplateItem, queryName, configTemplateName, filename} = generateMySpotConfig(this.database, this.table, queryType, fields, where, returnType, sqlTemplateInline)
              this.code = configTemplate
              this.$emit('on-loaded', configTemplate, {configTemplateItem, queryName, configTemplateName, filename})
            }
            break
          }
          case 'mySpotDAO': {
            const {queryName, queryType, columns, fields, where, order, limitType, argsType, returnType} = this.params
            if (columns.length > 0) {
              const {code, daoMethodCode} = generateDAOCode(queryName, queryType, this.database, this.table, columns, fields, where, order, limitType, argsType, returnType)
              this.code = code
              this.$emit('on-loaded', code, {daoMethodCode})
            }
            break
          }
          case 'mySpotBaseDAO': {
            const code = generateBaseDAOTemplate()
            this.code = code
            this.$emit('on-loaded', code, {})
          }
        }
      }
    }
  }
</script>

<style scoped>
  .spinLoading {
    animation: spinLoadingEffects 1s linear infinite;
  }

  @keyframes spinLoadingEffects {
    from {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
