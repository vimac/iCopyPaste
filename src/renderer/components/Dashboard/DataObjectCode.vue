<template>
  <div id="codeFrame">
    <CodeHighlight language="php">
      {{dataObjectCode}}
    </CodeHighlight>
    <Button id="copyCode" @click="onCopyCode" size="small" icon="ios-copy-outline"></Button>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import CodeHighlight from 'vue-code-highlight/src/CodeHighlight.vue'
  import 'prism-es6/components/prism-markup-templating'
  import 'prism-es6/components/prism-php'

  export default {
    name: 'DataObjectCode',
    components: {
      CodeHighlight
    },
    computed: {
      ...mapState({
        dataObjectCode: state => state.code.dataObjectCode
      })
    },
    methods: {
      onCopyCode () {
        const {clipboard} = require('electron')
        clipboard.writeText(this.dataObjectCode)
        this.$Message.info('Copied to clipboard')
      }
    }
  }
</script>

<style scoped>

  #codeFrame {
    position: relative;
  }

  #copyCode {
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 10000;
  }


</style>
