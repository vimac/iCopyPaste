<template>
  <Layout id="mainWrapper">
    <Menu theme="dark" mode="horizontal" :active-name="activatedMenu" id="navMenu">
      <div id="menuRightSide">
        <MenuItem name="/disconnect" to="/landing?action=disconnect">
          <Icon type="ios-exit"/>
          Disconnect
        </MenuItem>
      </div>
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
          <span class="progressBar"></span>
          {{message}}
          <Icon type="ios-cube"/> {{models.length}}
          <Icon type="ios-git-merge"/> {{queries.length}}
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
        models: state => state.model.models,
        queries: state => state.query.queries
      })
    },
    watch: {
      $route (newRoute, oldRoute) {
        const r = newRoute.path.match(/\/workspace\/([^/]*)/)
        if (r instanceof Array && r.length === 2) {
          this.activatedMenu = r.pop()
        }
      },
      models (newM, old) {
        this.sendNotification()
      },
      queries (newQ, old) {
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
        informationPanelClassname: '',
        message: 'IN PROJECT: ',
        messageHandler: null
      }
    },
    mounted () {
    },
    methods: {
      sendNotification () {
        if (this.messageHandler) {
          this.message = 'IN PROJECT: '
          this.informationPanelClassname = ''
          clearTimeout(this.messageHandler)
        }
        this.message = 'GENERATING: '
        this.informationPanelClassname = 'highlight'
        this.messageHandler = setTimeout(() => {
          this.message = 'IN PROJECT: '
          this.informationPanelClassname = ''
          this.messageHandler = null
        }, 1600)
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
