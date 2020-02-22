<template>
  <Layout>
    <Button class="sidebarTrigger" shape="circle" icon="ios-menu" @click="sidebarCollapseSwitch"></Button>
    <Sider width="250" id="sidebar" ref="sidebar" collapsible hide-trigger v-model="sidebarCollapsed"
           :collapsed-width="0">
      <Card class="sideCard" title="Models" :padding="0" icon="ios-list-box-outline" shadow>
        <CellGroup>
          <Cell name="all">
            All
            <i-switch size="small" slot="extra" v-model="enableAllModels"/>
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
                :key="name"
          >
            <i-switch size="small" v-model="selectedModels[name]" slot="extra" @on-change="toggleModel(name)"/>
          </Cell>
        </CellGroup>
      </Card>
    </Sider>
    <Content>
      <ModelList />
    </Content>
  </Layout>
</template>

<script>
  import {mapActions, mapState} from 'vuex'
  import ModelList from '../Model/ModelList'

  export default {
    name: 'ModelPage',
    components: {ModelList},
    computed: {
      ...mapState({
        tables: state => state.table.tables,
        modelList: state => state.model.modelList
      }),
      enableAllModels: {
        get () {
          return this.modelList.length === this.tables.length
        },
        set (value) {
          if (value) {
            this.updateModels(this.tables.map(item => item.name))
          } else {
            this.updateModels([])
          }
        }
      },
      selectedModels () {
        return this.modelList.reduce((sum, item) => {
          sum[item] = true
          return sum
        }, {})
      }
    },
    data () {
      return {
        sidebarCollapsed: false,
        tableFilter: '',
        checkedTables: []
      }
    },
    methods: {
      ...mapActions(['updateModels']),
      sidebarCollapseSwitch () {
        this.$refs.sidebar.toggleCollapse()
      },
      toggleModel (name) {
        const index = this.modelList.indexOf(name)
        if (index > -1) {
          this.updateModels(this.modelList.filter((val) => name !== val))
        } else {
          this.updateModels([...this.modelList, name])
        }
      }
    }
  }
</script>

<style scoped>

</style>
