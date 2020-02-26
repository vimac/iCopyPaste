<template>
  <div>
    <Tabs>
      <TabPane label="Template" name="template">
        <SettingsTemplate/>
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
  import SettingsTemplate from './SettingsTemplate'

  export default {
    name: 'ProjectSettings',
    components: {SettingsTemplate}
  }
</script>

<style scoped>

</style>
