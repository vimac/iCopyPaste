<template>
  <Layout>
    <Button class="sidebarTrigger" shape="circle" icon="ios-menu" @click="sidebarCollapseSwitch"></Button>
    <Sider width="250" id="sidebar" ref="sidebar" collapsible hide-trigger v-model="sidebarCollapsed"
           :collapsed-width="0">
      <Card class="sideCard" title="Query" :padding="0" icon="ios-list-box-outline" shadow>
        <CellGroup>
          <Cell
                  title="Generated Queries"
                  :selected="$route.fullPath === '/workspace/query'"
                  to="/workspace/query"
          >
            <span slot="arrow" />
          </Cell>
        </CellGroup>
        <div class="filterPanel">
          <Input placeholder="filter" size="small" icon="ios-search" v-model="tableFilter"/>
        </div>
        <CellGroup>
          <Cell v-for="{name, comment} in tables"
                v-if="tableFilter === '' || name.indexOf(tableFilter) > -1"
                :name="name"
                :title="name"
                :label="comment || ''"
                :selected="$route.params.table === name"
                :key="name"
                :to="'/workspace/query/' + name"
          >
            <span slot="arrow" />
          </Cell>
        </CellGroup>
      </Card>
    </Sider>
    <router-view/>
  </Layout>
</template>

<script>
  import {mapActions, mapState} from 'vuex'

  export default {
    name: 'QueryPage',
    computed: {
      ...mapState({
        config: state => state.db.config,
        tables: state => state.table.tables
      })
    },
    data () {
      return {
        sidebarCollapsed: false,
        tableFilter: '',
        enableSettings: false
      }
    },
    beforeMount () {
      /* if (this.config.connected !== 'succeed') {
        this.$router.push('/landing')
      }
      const {database} = this.config
      this.$conn.fetchTables(database) */
    },
    methods: {
      ...mapActions(['submitConnectionStatus']),
      sidebarCollapseSwitch () {
        this.$refs.sidebar.toggleCollapse()
      }
    }
  }
</script>

<style lang="scss" scoped>

  .ivu-card-body {
    padding: 5px 10px !important;
  }

  .infoPanel {
    font-size: 10px;
    padding: 5px 10px;
  }

  .sideCard {
    margin-bottom: 10px;
  }

  span.extra {
    color: #3a3d3f;
    font-weight: bold;
    display: inline-block;
  }

  span.extra:hover {
    color: #3a5fff;
    cursor: pointer;
  }

  #workingArea {
    width: 20%;
  }

</style>
