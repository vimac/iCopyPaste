<template>
  <Form :label-width="160" id="templateForm" ref="form">
    <FormItem label="Target">
      <Select size="small" v-model="target">
        <Option value="php+myspot">PHP + MySpot</Option>
      </Select>
    </FormItem>
    <FormItem label="Root Namespace">
      <Input :value="settings.myspot.root" name="root" @on-blur="onTemplateChange" type="text" size="small"/>
    </FormItem>
    <FormItem label="Data Object Suffix">
      <Input :value="settings.myspot.doSuffix" name="doSuffix" @on-blur="onTemplateChange" type="text" size="small"/>
    </FormItem>
    <FormItem label="Data Object Namespace">
      <Input :value="settings.myspot.doNamespace" name="doNamespace" @on-blur="onTemplateChange" type="text"
             size="small"/>
    </FormItem>
    <FormItem label="DAO Suffix">
      <Input :value="settings.myspot.daoSuffix" name="daoSuffix" @on-blur="onTemplateChange" type="text"
             size="small"/>
    </FormItem>
    <FormItem label="DAO Namespace">
      <Input :value="settings.myspot.daoNamespace" name="daoNamespace" @on-blur="onTemplateChange" type="text"
             size="small"/>
    </FormItem>
    <FormItem label="Base DAO Namespace">
      <Input :value="settings.myspot.baseDaoNamespace" name="baseDaoNamespace" @on-blur="onTemplateChange" type="text"
             size="small"/>
    </FormItem>
    <FormItem>
      <Button size="small" @click="resetAll">Reset All</Button>
    </FormItem>
  </Form>
</template>

<script>
  import {mapActions, mapState} from 'vuex'
  import {mySpotDefaults} from '../../constants/defaults'

  export default {
    name: 'SettingsTemplate',
    computed: {
      ...mapState({settings: state => state.settings})
    },
    data () {
      return {
        target: 'php+myspot'
      }
    },
    methods: {
      ...mapActions(['submitSettings']),
      resetAll () {
        this.submitSettings(mySpotDefaults)
      },
      onTemplateChange (event) {
        const {name, value} = event.target
        if (this.settings.myspot[name] !== value) {
          this.submitSettings({[name]: value})
          this.$Message.info('Settings updated')
        }
      }
    }
  }
</script>

<style scoped>

  #templateForm {
    font-size: 12px;
    padding: 10px 10px 0;
  }

</style>
