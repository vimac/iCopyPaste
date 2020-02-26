<template>
  <div class="codeFilePanel">
    <Spin v-if="spinLoading">
      <Icon type="ios-loading" size=80 class="spinLoading"></Icon>
    </Spin>
    <CodeHighlight v-else :language="language">{{code}}</CodeHighlight>
    <ButtonGroup class="codeCopy">
      <slot name="copyButtons">
        <Button @click="btnClick" size="small" icon="ios-copy-outline"/>
      </slot>
    </ButtonGroup>
  </div>
</template>

<script>
  import CodeHighlight from 'vue-code-highlight/src/CodeHighlight.vue'
  import {fileContentGenerator} from '../../generator/FileContentGenerator'

  export default {
    name: 'CodeFileContent',
    components: {CodeHighlight},
    props: {
      database: String,
      table: String,
      language: String,
      fileType: String,
      params: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data () {
      return {
        spinLoading: false,
        code: ''
      }
    },
    watch: {
      table (newTable, old) {
        this.refreshCode()
      },
      params: {
        handler (newParams, old) {
          this.refreshCode()
        },
        deep: true
      }
    },
    mounted () {
      this.refreshCode()
    },
    methods: {
      refreshCode () {
        this.spinLoading = true
        fileContentGenerator[this.fileType](this.database, this.table, this.params)
          .then((x) => {
            this.spinLoading = false
            const {code, payload} = x
            this.code = code
            this.$emit('on-loaded', code, payload)
          })
          .catch((err) => {
            this.spinLoading = false
            this.$Message.error(err.message)
          })
      },
      btnClick () {
        require('electron').clipboard.writeText(this.code)
        this.$Message.info('Code copied')
      }
    }
  }
</script>

<style scoped>
  .spinLoading {
    animation: spinLoadingEffects 1s linear infinite;
  }

  @keyframes spinLoadingEffects {
    from {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
