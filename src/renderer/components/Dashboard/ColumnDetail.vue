<template>
  <Tabs>
    <TabPane label="Reference" icon="ios-list-box-outline">
      <List size="small">
        <ListItem v-for="{name, type, nullable, key, comment} in columns" class="columnListItem" :key="name">
          <ListItemMeta>
            <Icon type="ios-cube-outline" slot="avatar" class="columnListAvatar"/>
            <div slot="title" class="columnListMeta">
              <span class="columnListMetaComment">{{comment}}</span>
              {{name}}
              <span class="columnListMetaInfo">{{type}}</span>
              <span v-if="key !== ''" class="columnListMetaInfo">{{key}}</span>
              <span v-if="nullable" class="columnListMetaInfo">Nullable</span>
            </div>
          </ListItemMeta>
        </ListItem>
      </List>
    </TabPane>
    <TabPane label="Raw" icon="ios-code">
      <CodeHighlight language="sql">{{ddl}}</CodeHighlight>
    </TabPane>
  </Tabs>
</template>

<script>
  import {mapState} from 'vuex'
  import CodeHighlight from 'vue-code-highlight/src/CodeHighlight.vue'
  import 'prism-es6/components/prism-sql'

  export default {
    name: 'ColumnDetail',
    components: {
      CodeHighlight
    },
    props: {
      database: String,
      table: String,
      columns: Array
    },
    computed: {
      ...mapState({ddl: state => state.column.ddl})
    }
  }
</script>

<style scoped>
  .columnListItem {
    padding-top: 2px !important;
    padding-bottom: 2px !important;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    cursor: default;
  }

  .columnListMeta {
    font-size: 12px;
    font-weight: bold;
  }

  .columnListAvatar {
    font-size: 14px;
    padding-top: 4px;
    width: 5px;
  }

  .columnListMetaInfo {
    display: inline-block;
    margin-left: 5px;
    color: #999;
  }

  .columnListMetaComment {
    float: right;
    max-width: 50%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #999;
    font-size: 12px;
  }
</style>
