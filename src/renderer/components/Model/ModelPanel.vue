<template>
  <div>
    <div class="panel">
      <ColumnDetail :database="database" :table="table" :columns="columns"/>
    </div>
    <div class="panel">
      <h1>
        <Icon type="ios-code-working"/>
        Data Object Code
      </h1>
    </div>
    <CodeHighlight :language="language">{{code}}</CodeHighlight>
  </div>
</template>

<script>
  import ColumnDetail from './ColumnDetail'
  import CodeHighlight from 'vue-code-highlight/src/CodeHighlight'

  export default {
    name: 'ModelPanel',
    components: {
      ColumnDetail,
      CodeHighlight
    },
    props: {
      database: String,
      table: String,
      columns: Array,
      code: String
    },
    data () {
      return {
        language: 'php',
        ddl: ''
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
