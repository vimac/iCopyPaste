<template>
  <Layout id="container">
    <Button id="sidebarTrigger" shape="circle" icon="ios-menu" @click="sidebarCollapseSwitch"></Button>
    <Sider id="sidebar" ref="sidebar" collapsible hide-trigger v-model="sidebarCollapsed" :collapsed-width="0">
      <Card class="sideCard" title="Connection" :padding="0" icon="ios-construct-outline" shadow>
        <div class="infoPanel">
          <p>Server: {{config.host + ':' + config.port}}</p>
          <p>Database: {{config.database}}</p>
          <hr/>
          <p>Target template: MySpot</p>
          <p>Language: PHP</p>
          <hr/>
          <p>
            <span class="extra" @click="showSettings"><Icon type="ios-settings-outline"/> SETTINGS</span>
            <span class="extra" @click="changeServer"><Icon type="ios-exit-outline"/> DISCONNECT</span>
          </p>
        </div>
      </Card>
      <Card class="sideCard" title="Tables" :padding="0" icon="ios-list-box-outline" shadow>
        <div id="filterPanel">
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
                :to="{path: '/dashboard/' + name}"/>
        </CellGroup>
      </Card>
    </Sider>
    <Layout id="workingArea">
      <router-view/>
    </Layout>
    <Modal v-model="enableSettings" class-name="vertical-center-modal" id="settingsDialog">
      <SettingsDialog/>
      <span slot="footer"/>
    </Modal>
  </Layout>
</template>

<script>
  import {mapActions, mapState} from 'vuex'
  import SettingsDialog from './Settings/SettingsDialog'

  export default {
    name: 'Dashboard',
    components: {SettingsDialog},
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
      if (this.config.connected !== 'succeed') {
        this.$router.push('/landing')
      }
      const {database} = this.config
      this.$conn.fetchTables(database)
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
    height: 100vh;
  }

  #sidebarTrigger {
    position: fixed;
    left: 10px;
    bottom: 10px;
    z-index: 100;
  }

  #sidebar {
    width: 220px;
    background: linear-gradient(45deg, #2B2B2B 25%, #3C3F41 0, #3C3F41 50%, #2B2B2B 0, #2B2B2B 75%, #3C3F41 0);
    background-size: 4.2px 4.2px;
    padding: 10px;
    box-sizing: border-box;
    white-space: nowrap;
    overflow-x: hidden;
    overflow-y: auto;
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

  #filterPanel {
    padding: 6px 10px 4px;
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

  hr {
    border-top: 1px dotted #ddd;
    border-bottom: 0;
    border-left: 0;
    border-right: 0;
    margin: 5px 0;
  }

</style>
