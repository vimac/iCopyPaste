<template>
  <div id="frame">
    <div id="hint">Select a table from the menu to start</div>
    <CodeIsPoetry :display="true"/>
  </div>
</template>

<script>
  import CodeIsPoetry from '../Widget/CodeIsPoetry'

  export default {
    name: 'AddedQueries',
    components: {CodeIsPoetry}
  }
</script>

<style scoped>
  div {
    font-size: 14px;
    cursor: default;
  }

  #hint {
    padding: 10px;
    width: 100%;
  }

</style>
