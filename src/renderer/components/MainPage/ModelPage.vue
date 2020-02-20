<template>
  <Layout>
    <Button class="sidebarTrigger" shape="circle" icon="ios-menu" @click="sidebarCollapseSwitch"></Button>
    <Sider width="250" id="sidebar" ref="sidebar" collapsible hide-trigger v-model="sidebarCollapsed"
           :collapsed-width="0">
      <Card class="sideCard" title="Tables" :padding="0" icon="ios-list-box-outline" shadow>
        <CellGroup>
          <Cell name="all">
            All
            <i-switch size="small" slot="extra"/>
          </Cell>
        </CellGroup>
        <hr/>
        <div class="filterPanel">
          <Input placeholder="filter" size="small" icon="ios-search" v-model="tableFilter"/>
        </div>
        <CellGroup>
          <Cell v-for="{name, comment} in tables"
                v-if="tableFilter === '' || name.indexOf(tableFilter) > -1"
                :name="name"
                :title="name"
                :label="comment"
                :selected="checkedTables.indexOf(name) > -1"
                :key="name"
          >
            <i-switch size="small" v-model="checkedTables.indexOf(name) > -1" slot="extra"/>
          </Cell>
        </CellGroup>
      </Card>
    </Sider>
  </Layout>
</template>

<script>
  import {mapState} from 'vuex'

  export default {
    name: 'ModelPage',
    computed: {
      ...mapState({
        tables: state => state.table.tables,
        selectedTable: state => state.table.selected
      })
    },
    data () {
      return {
        sidebarCollapsed: false,
        tableFilter: '',
        checkedTables: []
      }
    },
    methods: {
      sidebarCollapseSwitch () {
        this.$refs.sidebar.toggleCollapse()
      }
    }
  }
</script>

<style scoped>

  .checkTable {
    display: block;
  }

</style>
