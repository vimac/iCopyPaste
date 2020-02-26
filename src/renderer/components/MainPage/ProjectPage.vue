<template>
  <Layout id="projectPage">
    <Button class="sidebarTrigger" shape="circle" icon="ios-menu" @click="sidebarCollapseSwitch"></Button>
    <Sider ref="sidebar" width="150" id="sidebar" v-model="sidebarCollapsed" collapsible :collapsed-width="78"
           hide-trigger>
      <Menu ref="menu" width="auto" theme="dark" :active-name="activateMenu" :class="menuitemClasses"
            @on-select="onMenuSelect">
        <MenuItem name="files" to="/workspace/project/files">
          <Icon type="ios-briefcase"/>
          <span>Files</span>
        </MenuItem>
        <MenuItem name="settings" to="/workspace/project/settings">
          <Icon type="ios-construct"/>
          <span>Settings</span>
        </MenuItem>
        <MenuItem name="openProject">
          <Icon type="md-open"/>
          <span>Load</span>
        </MenuItem>
        <MenuItem name="saveProject">
          <Icon type="md-archive"/>
          <span>Save</span>
        </MenuItem>
        <MenuItem name="exportGenerated">
          <Icon type="md-download"/>
          <span>Export</span>
        </MenuItem>
      </Menu>
    </Sider>
    <Content>
      <router-view/>
    </Content>
  </Layout>
</template>

<script>
  import {mapActions, mapState} from 'vuex'

  export default {
    name: 'ProjectPage',
    computed: {
      ...mapState(['model', 'settings', 'query']),
      menuitemClasses () {
        return [
          'menuItem',
          this.sidebarCollapsed ? 'collapsedMenu' : ''
        ]
      }
    },
    data () {
      return {
        activateMenu: 'settings',
        sidebarCollapsed: false,
        buttonLocation: '/workspace/project/files'
      }
    },
    watch: {
      $route (newRoute, old) {
        this.buttonLocation = newRoute.fullPath
      }
    },
    methods: {
      ...mapActions(['updateModels', 'updateQueries', 'loadAllSettings']),
      sidebarCollapseSwitch () {
        this.$refs.sidebar.toggleCollapse()
      },
      onMenuSelect (name) {
        const {dialog} = require('electron').remote
        if (name === 'openProject') {
          const filename = dialog.showOpenDialog({
            filters: [
              {name: 'iCopyPaste Project', extensions: ['icpproj']},
              {name: 'All Files', extensions: ['*']}
            ]
          })
          filename && require('fs').readFile(filename.shift(), (err, buffer) => {
            if (err) {
              this.$Message.error(err.message)
            }
            try {
              const data = JSON.parse(buffer)
              const {models, queries, settings} = data
              models && this.updateModels(models)
              queries && this.updateQueries(queries)
              settings && this.loadAllSettings(settings)
              this.$Message.success('Project loaded')
            } catch (e) {
              this.$Message.error(e.message)
            }
          })
        } else if (name === 'saveProject') {
          const filename = dialog.showSaveDialog({
            filters: [
              {name: 'iCopyPaste Project', extensions: ['icpproj']},
              {name: 'All Files', extensions: ['*']}
            ]
          })
          const projectFileContent = {
            models: this.model.models,
            queries: this.query.queries,
            settings: this.settings
          }
          filename && require('fs').writeFile(filename, JSON.stringify(projectFileContent), (err) => {
            if (err) {
              this.$Message.error(err.message)
              return
            }
            this.$Message.success('Project saved')
          })
        } else if (name === 'exportGenerated') {
          const filename = dialog.showSaveDialog({
            filters: [
              {name: 'Zip Archive', extensions: ['zip']},
              {name: 'All Files', extensions: ['*']}
            ]
          })
          console.log(filename)
        }
        return name
      }
    }
  }
</script>

<style scoped>
  .menuItem span {
    display: inline-block;
    overflow: hidden;
    width: 69px;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
    transition: width .2s ease .2s;
  }

  .menuItem i {
    transform: translateX(0px);
    transition: font-size .2s ease, transform .2s ease;
    vertical-align: middle;
    font-size: 16px;
  }

  .collapsedMenu span {
    width: 0;
    transition: width .2s ease;
  }

  .collapsedMenu i {
    transform: translateX(5px);
    transition: font-size .2s ease .2s, transform .2s ease .2s;
    vertical-align: middle;
    font-size: 22px;
  }
</style>
