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
  import 'prism-es6/components/prism-sql'

  export default {
    name: 'CodeFileContent',
    components: {CodeHighlight},
    props: {
      database: String,
      table: String,
      language: String,
      fileType: String
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
      }
    },
    mounted () {
      this.refreshCode()
    },
    methods: {
      refreshCode () {
        this.spinLoading = true
        const errHandler = (err) => {
          this.spinLoading = false
          this.$Message.error(err.message)
        }
        switch (this.fileType) {
          case 'dataModel':
            this.$conn.fetchColumns(this.database, this.table)
              .then((fetchedColumns) => {
                const code = this.$modelGenerator.getDataModelByTable('myspot', this.database, this.table, fetchedColumns)
                this.spinLoading = false
                this.code = code
                this.$emit('on-async-loaded', code, {fetchedColumns})
              })
              .catch(errHandler)
            break
          case 'ddl':
            this.$conn.fetchTableDDL(this.database, this.table)
              .then(code => {
                this.spinLoading = false
                this.code = code
                this.$emit('on-async-loaded', code, {})
              })
              .catch(errHandler)
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
