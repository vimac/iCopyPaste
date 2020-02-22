<template>
  <Layout id="mainWrapper">
    <Menu theme="dark" mode="horizontal" :active-name="activatedMenu" id="navMenu">
      <div id="menuRightSide">
        <MenuItem name="/disconnect" to="/landing?action=disconnect">
          <Icon type="ios-exit"/>
          Disconnect
        </MenuItem>
      </div>
      <!--      <Submenu name="save">-->
      <!--        <template slot="title">-->
      <!--          <Icon type="md-archive"/>-->
      <!--          Save & Export-->
      <!--        </template>-->
      <!--        <MenuItem name="saveProject">Save Project</MenuItem>-->
      <!--        <MenuItem name="exportGenerated">Export Generated Files</MenuItem>-->
      <!--      </Submenu>-->
      <MenuItem name="project" to="/workspace/project/files">
        <Icon type="ios-apps"/>
        Project
      </MenuItem>
      <MenuItem name="model" to="/workspace/model">
        <Icon type="ios-cube"/>
        Model
      </MenuItem>
      <MenuItem name="query" to="/workspace/query">
        <Icon type="md-git-merge"/>
        Query
      </MenuItem>
      <div id="informationPanel">
        <span :class="informationPanelClassname">
          IN PROJECT:
          <Icon type="ios-cube"/> {{modelList.length}}
          <Icon type="ios-git-merge"/> {{modelList.length}}
        </span>
      </div>
    </Menu>
    <Content id="contentWrapper">
      <router-view></router-view>
    </Content>
  </Layout>
</template>

<script>
  import {mapState} from 'vuex'

  export default {
    name: 'Workspace',
    computed: {
      ...mapState({
        config: state => state.db.config,
        modelList: state => state.model.modelList
      })
    },
    watch: {
      $route (newRoute, oldRoute) {
        const r = newRoute.path.match(/\/workspace\/([^/]*)/)
        if (r instanceof Array && r.length === 2) {
          this.activatedMenu = r.pop()
        }
      },
      modelList (newModelList, oldModelList) {
        this.sendNotification()
      }
    },
    beforeMount () {
      if (this.config.connected !== 'succeed') {
        this.$router.push('/')
      }
    },
    data () {
      return {
        activatedMenu: 'project',
        informationPanelClassname: ''
      }
    },
    mounted () {
    },
    methods: {
      sendNotification () {
        this.$Notice.destroy()
        this.$Notice.success(
          {
            title: `Generated: ${this.modelList.length} model(s)`,
            duration: 2,
            onClose: () => {
              this.informationPanelClassname = ''
            }
          }
        )
        this.informationPanelClassname = 'highlight'
      }
    }
  }
</script>

<style scoped>

  #mainWrapper {
    height: 100vh;
  }

  #navMenu {
    background: linear-gradient(45deg, #2B2B2B 25%, #3C3F41 0, #3C3F41 50%, #2B2B2B 0, #2B2B2B 75%, #3C3F41 0);
    background-size: 4.2px 4.2px;
  }


</style>
