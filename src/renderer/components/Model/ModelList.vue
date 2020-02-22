<template>
  <div>
    <Collapse accordion simple @on-change="showModel" v-model="activateModel">
      <Panel v-for="item in metaData" :name="item.table" hide-arrow>
        <Icon type="ios-list-box-outline"/>
        {{item.fullName}}
        <span class="tableName">{{item.filename}}</span>
        <template slot="content">
          <Spin v-if="activateModel[0] === item.table && spinLoading">
            <Icon type="ios-loading" size=80 class="spinLoading"></Icon>
          </Spin>
          <ModelPanel v-if="activateModel[0] === item.table && !spinLoading"
                      :code="currentLoadedCode"
                      :columns="currentLoadedColumns"
                      :table="item.table"
                      :database="config.database"
          />
        </template>
      </Panel>
      <CodeIsPoetry :display="modelList.length === 0"/>
    </Collapse>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import CodeHighlight from 'vue-code-highlight/src/CodeHighlight.vue'
  import ModelPanel from './ModelPanel'
  import CodeIsPoetry from '../Widget/CodeIsPoetry'

  export default {
    name: 'ModelList',
    components: {
      CodeIsPoetry,
      ModelPanel,
      CodeHighlight
    },
    computed: {
      ...mapState({
        config: state => state.db.config,
        tables: state => state.table.tables,
        modelList: state => state.model.modelList
      }),
      metaData () {
        return this.$modelGenerator.getMetaDataByTables('myspot', this.config.database, this.modelList)
      }
    },
    data () {
      return {
        activateModel: [],
        language: 'php',
        spinLoading: false,
        currentLoadedCode: '',
        currentLoadedColumns: []
      }
    },
    methods: {
      showModel () {
        if (this.activateModel.length) {
          const [table] = this.activateModel
          this.spinLoading = true

          this.$conn.fetchColumns(this.config.database, table)
            .then((fetchedColumns) => {
              const code = this.$modelGenerator.getDataModelByTable('myspot', this.config.database, table, fetchedColumns)
              this.spinLoading = false
              this.currentLoadedCode = code
              this.currentLoadedColumns = fetchedColumns
            })
            .catch(err => {
              this.spinLoading = false
              this.$Message.error(err.message)
            })
        }
      }
    }
  }
</script>

<style scoped>
  .spinLoading {
    animation: spinLoadingEffects 1s linear infinite;
  }

  @keyframes spinLoadingEffects {
    from {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .tableName {
    color: #ccc;
  }
</style>
