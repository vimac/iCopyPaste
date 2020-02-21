<template>
  <div id="outerFrame">
    <h1>
      <Icon type="ios-checkbox-outline"/>
      Query Builder
    </h1>
    <QueryForm :database="config.database" :table="table" :columns="columnData"/>
  </div>
</template>

<script>
  import {mapActions, mapState} from 'vuex'
  import QueryForm from './QueryForm'
  import DataObjectCode from './DataObjectCode'

  export default {
    name: 'WorkingPanel',
    components: {DataObjectCode, QueryForm},
    computed: {
      ...mapState({
        config: state => state.db.config,
        columnData: state => state.column.columns
      })
    },
    data () {
      return {
        table: this.$route.params.table
      }
    },
    mounted () {
      this.refreshTable(this.table)
    },
    watch: {
      $route (newRoute, oldRoute) {
        if (newRoute.params.table !== this.table) {
          this.table = newRoute.params.table
        }
      },
      table (newTable, oldTable) {
        this.refreshTable(newTable)
      },
      columnData (newColumns, oldColumns) {
        this.$dot.generatePHPDataObject(this.config.database, this.table, newColumns)
      }
    },
    methods: {
      ...mapActions(['selectTable']),
      refreshTable (table) {
        this.selectTable(table)
        this.$conn.fetchColumns(this.config.database, table)
        this.$conn.fetchTableDDL(this.config.database, table)
      }
    }
  }
</script>

<style scoped>
  #outerFrame {
    width: 100%;
    height: 100%;
  }

  .spittedPanel {
    padding: 8px 12px;
    overflow-y: auto;
    height: 100%;
  }

</style>
