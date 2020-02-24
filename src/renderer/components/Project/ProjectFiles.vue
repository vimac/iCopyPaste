<template>
  <div id="projectFilesContainer">
    <Split v-model="split">
      <div slot="left">
        <Tree ref="fileTree" :data="treeData" @on-select-change="onTreeSelect"/>
      </div>
      <div slot="right">
        <CodeFileContent language="php" :database="config.database" :table="selectedNode.meta.table" v-if="selectedNode && selectedNode.nodeType === 'file'" :fileType="selectedNode.meta.fileType"/>
      </div>
    </Split>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import {convertFileListToTree} from '../../generator/FileListUtil'
  import CodeFileContent from '../Widget/CodeFileContent'

  export default {
    name: 'ProjectFiles',
    components: {CodeFileContent},
    computed: {
      ...mapState({
        config: state => state.db.config,
        tables: state => state.table.tables,
        modelList: state => state.model.modelList,
        query: state => state.query
      }),
      metaData () {
        return this.$modelGenerator.getMetaDataByTables('myspot', this.config.database, this.modelList)
      },
      treeData () {
        return [convertFileListToTree(this.metaData, this.query.queries, 'MyProject', (treeNode) => {
          treeNode.expand = treeNode.nodeType === 'dir'
          treeNode.render = (h, {root, node, data}) => {
            return h('span', [
              h('Icon', {
                props: {type: treeNode.nodeType === 'dir' ? 'ios-folder-open' : 'ios-document'},
                style: {marginRight: '5px'}
              }),
              data.title
            ])
          }
          // treeNode['children-key'] =
          if (treeNode.meta && treeNode.fileType === 'dataModel') {
            // do something wtih datamodel
          }
        })]
      }
    },
    data () {
      return {
        split: 0.35,
        selectedNode: null
      }
    },
    methods: {
      onTreeSelect () {
        this.selectedNode = this.$refs.fileTree.getSelectedNodes().pop()
      }
    }
  }
</script>

<style scoped>

  #projectFilesContainer {
    height: 100%;
  }

</style>
