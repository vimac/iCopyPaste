<template>
  <div>
    <Collapse accordion simple v-model="activateModel" v-if="models.length > 0">
      <Panel v-for="item in metaData" :name="item.table" hide-arrow>
        <Icon type="ios-list-box-outline"/>
        {{item.fullName}}
        <span class="tableName">{{item.filename}}</span>
        <template slot="content">
          <ModelPanel v-if="activateModel[0] === item.table "
                      :table="item.table"
                      :database="config.database"
          />
        </template>
      </Panel>
    </Collapse>
    <div v-else>Select a table on the left to start</div>
    <CodeIsPoetry :display="models.length === 0"/>
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
        models: state => state.model.models
      }),
      metaData () {
        return this.$modelGenerator.getDataObjectMetaDataByTables('myspot', this.config.database, this.models)
      }
    },
    data () {
      return {
        activateModel: [],
        language: 'php'
      }
    }
  }
</script>

<style scoped>
  .tableName {
    color: #ccc;
  }
</style>
