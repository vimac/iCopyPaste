<template>
  <div>
    <Tabs>
      <TabPane label="SQL Template">
        <CodeFileContent language="sql"
                         fileType="sql"
                         :database="database"
                         :table="table"
                         :params="params"
                         @on-loaded="onSqlTemplateLoaded"
        />
      </TabPane>
      <TabPane label="Configuration">
        <CodeFileContent language="php"
                         fileType="mySpotConfiguration"
                         :database="database"
                         :table="table"
                         :params="params"
                         @on-loaded="onMySpotConfigurationLoaded"
        />
      </TabPane>
      <TabPane label="Data Access Object">
        <CodeFileContent language="php"
                         fileType="mySpotDAO"
                         :database="database"
                         :table="table"
                         :params="params"
        />
      </TabPane>
      <TabPane label="Base DAO">
        <CodeFileContent language="php"
                         fileType="mySpotBaseDAO"
                         :params="params"
        />
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
  import CodeFileContent from '../Widget/CodeFileContent'

  export default {
    name: 'MySpotQueryCodes',
    components: {
      CodeFileContent
    },
    props: {
      database: String,
      table: String,
      params: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data () {
      return {
        sqlTemplate: '',
        sqlTemplateInline: '',
        queryName: ''
      }
    },
    watch: {
      params: {
        deep: true,
        handler (newP, old) {
          this.setDefaultParams()
        }
      }
    },
    mounted () {
      this.setDefaultParams()
    },
    methods: {
      setDefaultParams () {
        this.params.queryName || (this.params.queryName = '')
        this.params.queryType || (this.params.queryType = 'select')
        this.params.columns || (this.params.columns = [])
        this.params.fields || (this.params.fields = [])
        this.params.where || (this.params.where = [])
        this.params.order || (this.params.order = [])
        this.params.limitType || (this.params.limitType = 'no')
        this.params.argsType || (this.params.argsType = 'plain')
        this.params.returnType || (this.params.returnType = 'do')
      },
      onSqlTemplateLoaded (code, payload) {
        const {sqlTemplate, sqlTemplateInline} = payload
        this.params.sqlTemplate = sqlTemplate
        this.params.sqlTemplateInline = sqlTemplateInline
        this.$emit('on-updated-sql-template', code, payload)
      },
      onMySpotConfigurationLoaded (code, payload) {
        const {queryName} = payload
        this.params.queryName = queryName
        this.$emit('on-updated-configuration', code, payload)
      }
    }
  }
</script>

<style scoped>

</style>
