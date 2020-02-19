<template>
  <div>
    <Tabs>
      <TabPane label="Template" name="template">
        <TemplateTab/>
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
  import TemplateTab from './TemplateTab'

  export default {
    name: 'SettingsDialog',
    components: {TemplateTab}
  }
</script>

<style scoped>

</style>
