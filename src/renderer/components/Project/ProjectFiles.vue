<template>
  <div id="projectFilesContainer">
    <Split v-model="split">
      <div slot="left">
        <Tree ref="fileTree" :data="treeData" @on-select-change="onTreeSelect"/>
      </div>
      <div slot="right" id="fileListViewer">
        <CodeFileContent v-if="selectedNode && selectedNode.nodeType === 'file'"
                         language="php"
                         :database="config.database"
                         :table="selectedNode.meta.table"
                         :params="selectedNode.meta.params"
                         :fileType="selectedNode.meta.fileType"/>
      </div>
    </Split>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import {convertFileListToTree} from '../../generator/FileListUtil'
  import CodeFileContent from '../Widget/CodeFileContent'
  import {getQueryMeta} from '../../generator/MySpotGenerator'

  export default {
    name: 'ProjectFiles',
    components: {CodeFileContent},
    computed: {
      ...mapState({
        settings: state => state.settings,
        config: state => state.db.config,
        tables: state => state.table.tables,
        models: state => state.model.models,
        query: state => state.query
      }),
      metaData () {
        return this.$modelGenerator.getDataObjectMetaDataByTables('myspot', this.config.database, this.models)
      },
      treeData () {
        return [convertFileListToTree(
          this.metaData,
          getQueryMeta(this.config.database, this.query.queries),
          this.settings.myspot.projectRootDir,
          (treeNode, meta, {isNew}) => {
            if (isNew) {
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
              if (treeNode.meta && treeNode.meta.fileType === 'dataModel') {
                // do something wtih datamodel
              }
            } else {
              if (treeNode.meta && treeNode.meta.fileType === 'mySpotConfigurations') {
                treeNode.meta.params.configs = treeNode.meta.params.configs.concat(meta.params.configs)
              }
              if (treeNode.meta && treeNode.meta.fileType === 'mySpotDAOs') {
                treeNode.meta.params.functions = treeNode.meta.params.functions.concat(meta.params.functions)
              }
            }
          }
        )
        ]
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
        this.selectedNode = this.$refs.fileTree.getSelectedNodes().shift()
      }
    }
  }
</script>

<style scoped>

  #projectFilesContainer {
    height: 100%;
  }

</style>
