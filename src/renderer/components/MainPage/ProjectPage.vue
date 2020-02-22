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
  export default {
    name: 'ProjectPage',
    computed: {
      menuitemClasses () {
        return [
          'menuItem',
          this.sidebarCollapsed ? 'collapsedMenu' : ''
        ]
      }
    },
    data () {
      return {
        activateMenu: 'files',
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
      sidebarCollapseSwitch () {
        this.$refs.sidebar.toggleCollapse()
      },
      onMenuSelect (name) {
        const {dialog} = require('electron').remote
        if (name === 'saveProject') {
          dialog.showSaveDialog({
            filters: [
              {name: 'iCopyPaste Project', extensions: ['icpproj']},
              {name: 'All Files', extensions: ['*']}
            ]
          })
        } else if (name === 'exportGenerated') {
          // do nothing
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
