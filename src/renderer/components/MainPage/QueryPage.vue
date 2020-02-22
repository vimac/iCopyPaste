<template>
  <Layout id="container">
    <Button class="sidebarTrigger" shape="circle" icon="ios-menu" @click="sidebarCollapseSwitch"></Button>
    <Sider width="250" id="sidebar" ref="sidebar" collapsible hide-trigger v-model="sidebarCollapsed" :collapsed-width="0">
      <Card class="sideCard" title="Tables" :padding="0" icon="ios-list-box-outline" shadow>
        <div class="filterPanel">
          <Input placeholder="filter" size="small" icon="ios-search" v-model="tableFilter"/>
        </div>
        <CellGroup>
          <Cell v-for="{name, comment} in tables"
                v-if="tableFilter === '' || name.indexOf(tableFilter) > -1"
                :name="name"
                :title="name"
                :label="comment || ''"
                :selected="selectedTable === name"
                :key="name"
                :to="{path: '/query/' + name}"/>
        </CellGroup>
      </Card>
    </Sider>
    <Layout id="workingArea">
      <router-view/>
    </Layout>
  </Layout>
</template>

<script>
  import {mapActions, mapState} from 'vuex'

  export default {
    name: 'QueryPage',
    computed: {
      ...mapState({
        config: state => state.db.config,
        tables: state => state.table.tables,
        selectedTable: state => state.table.selected
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
    watch: {
      config (newConfig, oldConfig) {
        if (newConfig.connected !== 'succeed') {
          this.$router.push('/landing')
        }
      }
    },
    methods: {
      ...mapActions(['submitConnectionStatus']),
      sidebarCollapseSwitch () {
        this.$refs.sidebar.toggleCollapse()
      },
      showSettings () {
        this.enableSettings = true
      },
      changeServer () {
        this.$conn.close().then(() => {
          this.submitConnectionStatus({connected: 'no'})
          this.$router.push('/')
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

  #container {
    background: #ccc;
  }

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

  #workingArea {
    height: 100%;
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


</style>
