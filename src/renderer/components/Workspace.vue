<template>
  <Layout id="mainWrapper">
    <Menu theme="dark" mode="horizontal" :active-name="activatedMenu" id="navMenu">
      <MenuItem name="project" to="project">
        <Icon type="ios-briefcase"/>
        Project
      </MenuItem>
      <MenuItem name="model" to="model">
        <Icon type="ios-cube"/>
        Model
      </MenuItem>
      <MenuItem name="query" to="query">
        <Icon type="md-git-merge"/>
        Query
      </MenuItem>
      <!--      <MenuItem name="settings">-->
      <!--        <Icon type="ios-construct"/>-->
      <!--        Settings-->
      <!--      </MenuItem>-->
      <Submenu name="information">
        <template slot="title">
          <Icon type="ios-information-circle"/>
          Information
        </template>
        <MenuGroup title="Host">
          <MenuItem name="hostAndPort" disabled>{{config.host + ':' + config.port}}</MenuItem>
        </MenuGroup>
        <MenuGroup title="Database">
          <MenuItem name="database" disabled>{{config.database}}</MenuItem>
        </MenuGroup>
      </Submenu>
      <MenuItem name="disconnect" to="/landing?action=disconnect">
        <Icon type="ios-exit"/>
        Disconnect
      </MenuItem>
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
        config: state => state.db.config
      })
    },
    watch: {
      $route (newRoute, oldRoute) {
        const r = newRoute.path.match(/\/workspace\/([^/]*)/)
        if (r instanceof Array && r.length === 2) {
          this.activatedMenu = r.pop()
        }
      }
    },
    beforeMount () {
      if (this.config.connected !== 'succeed') {
        this.$router.push('/')
      }
    },
    data () {
      return {
        activatedMenu: 'model'
      }
    },
    mounted () {
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
