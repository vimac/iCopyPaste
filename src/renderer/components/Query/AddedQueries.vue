<template>
  <Content id="queryContent">
    <Collapse v-if="query.queries.length > 0" accordion simple v-model="activateQuery">
      <Panel v-for="(q, idx) in query.queries" :name="q.fullQueryName" hide-arrow>
        <span class="rightPart" @click.stop="removeButtonClick(idx)">
          <Icon type="ios-trash-outline"/>
        </span>
        <Icon type="ios-list-box-outline"/>
        {{config.database}}.{{q.table}}.{{q.queryName}}
        <div slot="content">
          <MySpotQueryCodes :database="config.database" :table="q.table" :params="q.params"/>
        </div>
      </Panel>
    </Collapse>
    <div v-else>
      Select a table on the left to start
    </div>
    <CodeIsPoetry :display="query.queries.length === 0"/>
  </Content>
</template>

<script>
  import CodeIsPoetry from '../Widget/CodeIsPoetry'
  import {mapActions, mapState} from 'vuex'
  import MySpotQueryCodes from '../Widget/MySpotQueryCodes'

  export default {
    name: 'AddedQueries',
    components: {MySpotQueryCodes, CodeIsPoetry},
    computed: {
      ...mapState({
        config: state => state.db.config,
        query: state => state.query
      })
    },
    data () {
      return {
        activateQuery: []
      }
    },
    methods: {
      ...(mapActions(['updateQueries'])),
      removeButtonClick (queryIdx) {
        this.updateQueries(this.query.queries.filter((v, i) => {
          return i !== queryIdx
        }))
      }
    }
  }
</script>

<style scoped>
  div {
    font-size: 14px;
    cursor: default;
  }

  .rightPart {
    float: right;
    margin-right: 20px;
    color: #aaa;
  }

  .rightPart:hover {
    color: #000;
  }

</style>
