<template>
  <div id="projectFilesContainer">
    <Split v-model="split">
      <div slot="left">
        <Tree :data="treeData"/>
      </div>
      <div slot="right">

      </div>
    </Split>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import {convertFileListToTree} from '../../generator/FIleListUtil'

  export default {
    name: 'ProjectFiles',
    computed: {
      ...mapState({
        config: state => state.db.config,
        tables: state => state.table.tables,
        modelList: state => state.model.modelList
      }),
      metaData () {
        return this.$modelGenerator.getMetaDataByTables('myspot', this.config.database, this.modelList)
      },
      treeData () {
        return [convertFileListToTree(this.metaData, 'MyProject', (treeNode) => {
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
        })]
      }
    },
    data () {
      return {
        split: 0.35
      }
    }
  }
</script>

<style scoped>

  #projectFilesContainer {
    height: 100%;
  }

</style>
