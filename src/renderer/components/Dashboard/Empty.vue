<template>
  <div id="frame">
    <div id="hint">Select a table from the menu to start</div>
    <CodeIsPoetry :display="true"/>
  </div>
</template>

<script>
  import CodeIsPoetry from '../Widget/CodeIsPoetry'

  export default {
    name: 'Empty',
    components: {CodeIsPoetry}
  }
</script>

<style scoped>
  div {
    font-size: 14px;
    text-shadow: 1px 1px 1px #ccc;
    cursor: default;
  }

  #hint {
    padding: 10px;
    width: 100%;
  }

</style>
