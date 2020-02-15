<template>
  <div id="frame">
    <div id="hint">Select a table from the menu to start</div>
    <div id="codePoetry">
      Code is poetry<br />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Empty'
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

  #codePoetry {
    position: fixed;
    right: 20px;
    bottom: 20px;
    color: #999;
  }
</style>
