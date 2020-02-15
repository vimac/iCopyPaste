<template>
  <Split id="outerFrame" v-model="outerFrame">
    <div slot="left" class="spittedPanel">
      <div class="panel">
        <ColumnDetail :database="config.database" :table="table" :columns="columnData"/>
      </div>
      <div class="panel">
        <h1>
          <Icon type="ios-code-working"/>
          Data Object Code
        </h1>
        <DataObjectCode/>
      </div>
    </div>
    <div slot="right" class="spittedPanel">
      <h1>
        <Icon type="ios-checkbox-outline"/>
        Query Builder
      </h1>
      <QueryForm :database="config.database" :table="table" :columns="columnData"/>
    </div>
  </Split>
</template>

<script>
  import {mapActions, mapState} from 'vuex'
  import ColumnDetail from './ColumnDetail'
  import QueryForm from './QueryForm'
  import DataObjectCode from './DataObjectCode'

  export default {
    name: 'WorkingPanel',
    components: {DataObjectCode, QueryForm, ColumnDetail},
    computed: {
      ...mapState({
        config: state => state.db.config,
        columnData: state => state.column.columns
      })
    },
    data () {
      return {
        outerFrame: 0.4,
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

  #innerFrame {
    width: 100%;
    height: 100%;
  }

  .spittedPanel {
    padding: 8px 12px;
    overflow-y: auto;
    height: 100%;
  }

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
