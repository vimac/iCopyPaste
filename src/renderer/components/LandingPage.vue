<template>
  <div id="wrapper">
    <div id="loginPanel">
      <div id="titlePanel">
        Connect to a MySQL Database
      </div>
      <div id="historyList">
        <div id="noStored" v-if="storedList.length === 0">No saved connection</div>
        <CellGroup @on-click="onSelectHistoryItem">
          <Cell v-for="({host, port, database, user}, index) in storedList"
                :title="host + ':' + port"
                :name="index"
          >
            <div slot="label">
              <Icon type="ios-person-outline"/>
              {{user}}
              <Icon type="ios-folder-outline"/>
              {{database}}
            </div>
            <Icon class="deleteSaved" slot="extra" type="ios-close" @click.stop="eraseStored(index)"/>
          </Cell>
        </CellGroup>
      </div>
      <div id="formPanel">
        <Form ref="form" :model="inputConfig" :rules="formRules" :label-width=90 :disabled="disableForm">
          <FormItem prop="host" label="Host">
            <Input type="text" v-model="inputConfig.host" placeholder="Host"/>
          </FormItem>
          <FormItem prop="port" label="Port">
            <Input type="text" v-model="inputConfig.port" placeholder="Port"/>
          </FormItem>
          <FormItem prop="database" label="Database">
            <Input type="text" v-model="inputConfig.database" placeholder="Database"/>
          </FormItem>
          <FormItem prop="username" label="Username">
            <Input type="text" v-model="inputConfig.user" placeholder="Username"/>
          </FormItem>
          <FormItem prop="password" label="Password">
            <Input type="password" v-model="inputConfig.pass" placeholder="Password"/>
          </FormItem>
          <FormItem prop="save" label="Save">
            <Checkbox v-model="saveForm"/>
          </FormItem>
          <FormItem>
            <Button type="primary" :loading="modalLoading" @click="doConnect">OK</Button>
          </FormItem>
        </Form>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapActions, mapState} from 'vuex'

  export default {
    name: 'LandingPage',
    components: {},
    computed: {
      ...mapState({config: state => state.db.config, storedList: state => state.store.storedList})
    },
    watch: {
      config (newConfig, oldConfig) {
        if (newConfig.connected === 'error') {
          this.$Message['error'](
            {
              background: true,
              content: 'Error: ' + (newConfig.errorMessage || '')
            }
          )
          this.modalLoading = false
          this.submitConnectionStatus({connected: 'no', errorMessage: ''})
        }
        if (newConfig.connected === 'succeed') {
          if (this.saveForm) {
            this.addConnection([this.inputConfig])
          }
          this.modalInfoDisplay = false
          this.$router.push('/dashboard/')
        }
        this.disableForm = false
      }
    },
    mounted () {
      // this.$refs['modalInfo'].$emit('on-ok') // auto connect in development env
    },
    data () {
      return {
        modalInfoDisplay: true,
        saveForm: false,
        disableForm: false,
        inputConfig: {
          host: 'localhost',
          port: 3306,
          database: 'test',
          user: 'root',
          pass: ''
        },
        formRules: {
          host: [
            {required: true, trigger: 'blur'}
          ],
          port: [
            {required: true, trigger: 'blur', type: 'number'}
          ],
          database: [
            {required: true, trigger: 'blur'}
          ]
        },
        modalLoading: false
      }
    },
    methods: {
      ...mapActions(['submitConfig', 'submitConnectionStatus', 'addConnection', 'setConnections']),
      doConnect () {
        this.modalLoading = true
        this.disableForm = true
        this.submitConfig(this.inputConfig)
      },
      onSelectHistoryItem (name) {
        const item = this.storedList[name]
        this.inputConfig.host = item.host
        this.inputConfig.port = item.port
        this.inputConfig.database = item.database
        this.inputConfig.user = item.user
        this.inputConfig.pass = item.pass
      },
      eraseStored (index) {
        this.setConnections(this.storedList.filter((item, idx) => idx !== index))
        return false
      }
    }
  }
</script>

<style lang="scss" scoped>
  #wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    background: linear-gradient(45deg, #2B2B2B 25%, #3C3F41 0, #3C3F41 50%, #2B2B2B 0, #2B2B2B 75%, #3C3F41 0);
    background-size: 4.2px 4.2px;
  }

  #loginPanel {
    width: 600px;
    height: 350px;
    display: flex;
    background: #fafafa;
    border-radius: 10px;
    padding: 10px;
    flex-wrap: wrap;
    box-sizing: content-box;
  }

  #titlePanel {
    width: 600px;
    font-weight: bold;
    line-height: 30px;
    height: 30px;
    text-align: center;
    background: #3C3F41;
    color: #ccc;
    margin-bottom: 5px;
    border-radius: 5px;
  }

  #historyList {
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;
    width: 250px;
    height: 315px;
    border-right: 1px dotted #ccc;
  }

  #formPanel {
    flex-basis: 350px;
  }

  #noStored {
    color: #ccc;
  }

  .deleteSaved {
    font-size: 24px;
    color: #ccc;
  }

  .deleteSaved:hover {
    color: red;
  }

  .ivu-form-item {
    margin-bottom: 12px;
  }

  form {
    padding: 10px 0;
  }
</style>
