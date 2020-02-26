<template>
  <Form :label-width="160" id="templateForm" ref="form">
    <FormItem label="Target">
      <Select size="small" v-model="target">
        <Option value="myspot">PHP + MySpot</Option>
      </Select>
    </FormItem>
    <FormItem label="Project Name">
      <Input :value="settings.myspot.projectName" name="projectName" @on-blur="onTemplateChange" type="text"
             size="small"/>
    </FormItem>
    <FormItem label="Project Root Dir">
      <Input :value="settings.myspot.projectRootDir" name="projectRootDir" @on-blur="onTemplateChange" type="text"
             size="small"/>
    </FormItem>
    <FormItem label="Source Root Namespace">
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
    <FormItem label="Namespace Variables:">
      <ul style="list-style: none">
        <li><b>${root}</b> - Project Root Dir</li>
        <li><b>${database}</b> - Connected Database Name</li>
      </ul>
    </FormItem>
  </Form>
</template>

<script>
  import {mapActions, mapState} from 'vuex'
  import {mySpotDefaults} from '../../constants/defaults'
  import {setWindowTitle} from '../../message'

  export default {
    name: 'SettingsTemplate',
    computed: {
      ...mapState({settings: state => state.settings})
    },
    data () {
      return {
        target: 'myspot'
      }
    },
    methods: {
      ...mapActions(['submitSettings']),
      resetAll () {
        setWindowTitle(mySpotDefaults.projectName)
        this.submitSettings(mySpotDefaults)
      },
      onTemplateChange (event) {
        const {name, value} = event.target
        if (name === 'projectName') {
          setWindowTitle(value)
        }
        if (this.settings.myspot[name] !== value) {
          this.submitSettings({[name]: value})
          this.$Message.destroy()
          this.$Message.success('Settings updated')
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
