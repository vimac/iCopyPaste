<template>
  <Form :label-width="160" id="templateForm" ref="form">
    <FormItem label="Target">
      <RadioGroup v-model="target">
        <Radio label="myspot">PHP + MySpot</Radio>
        <Radio label="mybatis">Java + MyBatis</Radio>
      </RadioGroup>
    </FormItem>
    <template v-if="target === 'myspot'">
      <FormItem label="Project Name">
        <Input :value="myspot.projectName" name="projectName" @on-blur="onTemplateChange" type="text"
               size="small"/>
      </FormItem>
      <FormItem label="Project Root Dir">
        <Input :value="myspot.projectRootDir" name="projectRootDir" @on-blur="onTemplateChange" type="text"
               size="small"/>
      </FormItem>
      <FormItem label="Source Root Namespace">
        <Input :value="myspot.root" name="root" @on-blur="onTemplateChange" type="text" size="small"/>
      </FormItem>
      <FormItem label="Data Object Suffix">
        <Input :value="myspot.doSuffix" name="doSuffix" @on-blur="onTemplateChange" type="text" size="small"/>
      </FormItem>
      <FormItem label="Data Object Namespace">
        <Input :value="myspot.doNamespace" name="doNamespace" @on-blur="onTemplateChange" type="text"
               size="small"/>
      </FormItem>
      <FormItem label="DAO Suffix">
        <Input :value="myspot.daoSuffix" name="daoSuffix" @on-blur="onTemplateChange" type="text"
               size="small"/>
      </FormItem>
      <FormItem label="DAO Namespace">
        <Input :value="myspot.daoNamespace" name="daoNamespace" @on-blur="onTemplateChange" type="text"
               size="small"/>
      </FormItem>
      <FormItem label="Base DAO Namespace">
        <Input :value="myspot.baseDaoNamespace" name="baseDaoNamespace" @on-blur="onTemplateChange" type="text"
               size="small"/>
      </FormItem>
    </template>
    <template v-else-if="target === 'mybatis'">
      <FormItem label="Project Name">
        <Input :value="mybatis.projectName" name="projectName" @on-blur="onTemplateChange" type="text"
               size="small"/>
      </FormItem>
      <FormItem label="Project Root Dir">
        <Input :value="mybatis.projectRootDir" name="projectRootDir" @on-blur="onTemplateChange" type="text"
               size="small"/>
      </FormItem>
      <FormItem label="XML Mapper Path">
        <Input :value="mybatis.xmlPath" name="xmlPath" @on-blur="onTemplateChange" type="text"
               size="small"/>
      </FormItem>
      <FormItem label="XML Mapper Suffix">
        <Input :value="mybatis.xmlSuffix" name="xmlSuffix" @on-blur="onTemplateChange" type="text"
               size="small"/>
      </FormItem>
      <FormItem label="Source Root">
        <Input :value="mybatis.codeRoot" name="codeRoot" @on-blur="onTemplateChange" type="text"
               size="small"/>
      </FormItem>
      <FormItem label="Root Package">
        <Input :value="mybatis.rootPackage" name="rootPackage" @on-blur="onTemplateChange" type="text"
               size="small"/>
      </FormItem>
      <FormItem label="Data Object Suffix">
        <Input :value="mybatis.doSuffix" name="doSuffix" @on-blur="onTemplateChange" type="text"
               size="small"/>
      </FormItem>
      <FormItem label="Data Object Package">
        <Input :value="mybatis.doPackage" name="doPackage" @on-blur="onTemplateChange" type="text"
               size="small"/>
      </FormItem>
      <FormItem label="Getter/Setter">
        <RadioGroup :value="mybatis.getterSetter" @on-change="onRadioChange(...arguments, 'getterSetter')">
          <Radio label="native">Native Getter/Setter</Radio>
          <Radio label="lombokGetterSetter">Lombok @Getter/@Setter</Radio>
          <Radio label="lombokData">Lombok @Data</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="Additional Annotations">
        <CheckboxGroup v-model="mybatisEnableAnnotations">
          <Checkbox label="lombokAllArgsConstructor">Lombok @AllArgsConstructor</Checkbox>
          <Checkbox label="lombokNoArgsConstructor">Lombok @NoArgsConstructor</Checkbox>
          <Checkbox label="lombokBuilder">Lombok @Builder</Checkbox>
        </CheckboxGroup>
      </FormItem>
      <FormItem label="DAO Suffix">
        <Input :value="mybatis.daoSuffix" name="daoSuffix" @on-blur="onTemplateChange" type="text"
               size="small"/>
      </FormItem>
      <FormItem label="DAO Package">
        <Input :value="mybatis.daoPackage" name="daoPackage" @on-blur="onTemplateChange" type="text"
               size="small"/>
      </FormItem>

    </template>
    <FormItem>
      <Button size="small" @click="resetAll">Reset All</Button>
    </FormItem>
    <FormItem label="Template Variables:">
      <ul style="list-style: none">
        <li><b>${root}</b> - Project Root Namespace or Package</li>
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
      ...mapState(['settings']),
      mybatis () {
        return this.settings.mybatis
      },
      myspot () {
        return this.settings.myspot
      },
      target: {
        get () {
          return this.settings.target
        },
        set (v) {
          this.submitSettings({target: v})
          this.notice()
        }
      },
      mybatisEnableAnnotations: {
        get () {
          return this.settings.mybatis.enableAnnotations
        },
        set (value) {
          this.submitSettings({[this.target]: {'enableAnnotations': value}})
          this.notice()
        }
      }
    },
    data () {
      return {}
    },
    methods: {
      ...mapActions(['submitSettings', 'resetSettings']),
      resetAll () {
        setWindowTitle(mySpotDefaults.projectName)
        this.resetSettings()
        this.notice()
      },
      notice () {
        this.$Message.destroy()
        this.$Message.success('Settings updated')
      },
      onRadioChange (value, name) {
        // if (value instanceof Array) {
        //   value = value.concat(this[this.target][source])
        // }
        // console.log(value)
        this.submitSettings({[this.target]: {[name]: value}})
        this.notice()
      },
      onTemplateChange (event) {
        const {name, value} = event.target
        if (name === 'projectName') {
          setWindowTitle(value)
        }
        if (this.settings[this.target][name] !== value) {
          this.submitSettings({[this.target]: {[name]: value}})
          this.notice()
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
