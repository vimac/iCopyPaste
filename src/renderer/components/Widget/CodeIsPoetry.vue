<template>
  <div id="codePoetry" :class="animateClass">
    CODE IS POETRY
  </div>
</template>

<script>
  export default {
    name: 'CodeIsPoetry',
    props: {
      display: {default: false, type: Boolean}
    },
    computed: {
      animateClass () {
        return this.display ? 'animate' : ''
      }
    },
    data () {
      return {}
    }
  }
</script>

<style scoped>
</style>
