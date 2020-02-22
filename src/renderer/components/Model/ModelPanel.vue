<template>
  <div>
    <div class="panel">
      <ColumnDetail :database="database" :table="table" :columns="this.columns" />
    </div>
    <div class="panel">
      <h1>
        <Icon type="ios-code-working"/>
        Data Object Code
      </h1>
    </div>
    <CodeFileContent :database="this.database" :table="this.table" language="php" fileType="dataModel" @on-async-loaded="onCodeLoaded" />
  </div>
</template>

<script>
  import ColumnDetail from './ColumnDetail'
  import CodeHighlight from 'vue-code-highlight/src/CodeHighlight'
  import CodeFileContent from '../Widget/CodeFileContent'

  export default {
    name: 'ModelPanel',
    components: {
      CodeFileContent,
      ColumnDetail,
      CodeHighlight
    },
    props: {
      database: String,
      table: String
    },
    data () {
      return {
        language: 'php',
        columns: []
      }
    },
    methods: {
      onCodeLoaded (code, meta) {
        const {fetchedColumns} = meta
        this.columns = fetchedColumns
      }
    }
  }
</script>

<style scoped>
  h1 {
    font-size: 13px;
    background: #eee;
    padding: 2px 7px;
    cursor: default;
    font-weight: normal;
    border-radius: 3px;
  }

  .panel {
    margin-bottom: 10px;
  }
</style>
