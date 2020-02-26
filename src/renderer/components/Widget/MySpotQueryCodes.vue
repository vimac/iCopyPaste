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
        >
          <template slot="copyButtons">
            <Button @click="onCopyExpanded" size="small" icon="ios-copy-outline">Expanded</Button>
            <Button @click="onCopySingleLine" size="small" icon="ios-copy-outline">Single line</Button>
          </template>
        </CodeFileContent>
      </TabPane>
      <TabPane label="Configuration">
        <CodeFileContent language="php"
                         fileType="mySpotConfiguration"
                         :database="database"
                         :table="table"
                         :params="{sqlTemplateInline, sqlTemplate,...params}"
                         @on-loaded="onMySpotConfigurationLoaded"
        >
          <template slot="copyButtons">
            <Button @click="onCopyConfig" size="small" icon="ios-copy-outline">Whole file</Button>
            <Button @click="onCopyConfigItem" size="small" icon="ios-copy-outline">Single item</Button>
          </template>
        </CodeFileContent>
      </TabPane>
      <TabPane label="Data Access Object">
        <CodeFileContent language="php"
                         fileType="mySpotDAO"
                         :database="database"
                         :table="table"
                         :params="{queryName, ...params}"
                         @on-loaded="onMySpotDAOLoaded"
        >
          <template slot="copyButtons">
            <Button @click="onCopyDAO" size="small" icon="ios-copy-outline">Class</Button>
            <Button @click="onCopyDAOMethod" size="small" icon="ios-copy-outline">Method</Button>
          </template>
        </CodeFileContent>
      </TabPane>
      <TabPane label="Base DAO">
        <CodeFileContent language="php"
                         fileType="mySpotBaseDAO"
                         :params="params"
                         @on-loaded="onMySpotBaseDAOLoaded"
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
        configTemplate: '',
        configTemplateItem: '',
        daoCode: '',
        baseDAOCode: '',
        queryName: '',
        sqlTemplate: '',
        sqlTemplateInline: ''
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
        this.sqlTemplate = sqlTemplate
        this.sqlTemplateInline = sqlTemplateInline
        this.$emit('on-updated-sql-template', code, payload)
      },
      onMySpotConfigurationLoaded (code, payload) {
        const {configTemplateItem, queryName} = payload
        this.queryName = queryName
        this.configTemplate = code
        this.configTemplateItem = configTemplateItem
        this.$emit('on-updated-configuration', code, payload)
      },
      onMySpotDAOLoaded (code, payload) {
        this.daoCode = code
      },
      onMySpotBaseDAOLoaded (code, payload) {
        this.baseDAOCode = code
      },
      copy (target, message) {
        require('electron').clipboard.writeText(target)
        this.$Message.info(message)
      },
      onCopyExpanded () {
        this.copy(this.params.sqlTemplate, 'Expanded SQL template copied to clipboard')
      },
      onCopySingleLine () {
        this.copy(this.params.sqlTemplateInline, 'Single configuration item copied to clipboard')
      },
      onCopyConfig () {
        this.copy(this.configTemplate, 'Expanded SQL template copied to clipboard')
      },
      onCopyConfigItem () {
        this.copy(this.configTemplateItem, 'Single configuration item copied to clipboard')
      },
      onCopyDAO () {
        this.copy(this.daoCode, 'DAO class code copied to clipboard')
      },
      onCopyDAOMethod () {
        const daoMethodCode = this.daoCode.match(/\{\s+( {4}\/[\s\S]+public function[\s\S]+\})\s+\}$/m)[1]
        this.copy(daoMethodCode, 'DAO method code copied to clipboard')
      }
    }
  }
</script>

<style scoped>

</style>
