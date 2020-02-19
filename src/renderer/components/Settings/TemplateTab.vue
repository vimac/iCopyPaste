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

  export default {
    name: 'TemplateTab',
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
        this.submitSettings({
          // eslint-disable-next-line no-template-curly-in-string
          root: 'MyProject',
          // eslint-disable-next-line no-template-curly-in-string
          doSuffix: 'DO',
          // eslint-disable-next-line no-template-curly-in-string
          doNamespace: '${root}\\DataObject\\${database}',
          // eslint-disable-next-line no-template-curly-in-string
          daoSuffix: 'DAO',
          // eslint-disable-next-line no-template-curly-in-string
          daoNamespace: '${root}\\DAO\\${database}',
          // eslint-disable-next-line no-template-curly-in-string
          baseDaoNamespace: '${root}\\DAO'
        })
      },
      onTemplateChange (event) {
        const {name, value} = event.target

        /** const availableVars = ['root', 'database', 'table']
        let result = []
        const regVar = /\${(\w+?)}/g
        let m = null
        while ((m = regVar.exec(value)) !== null) {
          result.push(m)
        }
        result.map(item => item[1]).forEach(item => {
        }) */

        this.submitSettings({[name]: value})
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
