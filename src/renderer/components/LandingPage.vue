<template>
  <div id="wrapper">
    <Modal
            v-model="modalInfoDisplay"
            title="Connect to a MySQL server"
            ref="modalInfo"
            :loading="true"
            :mask-closable="false"
            :closable="false"
            class-name="vertical-center-modal"
            @on-ok="doConnect">
      <Layout id="modalContent">
        <Sider id="historyList">
          <CellGroup @on-click="onSelectHistoryItem">
            <Cell v-for="({host, port, database, user}, index) in storedList"
                  :title="host + ':' + port"
                  :label="'u: ' + user + ' db: ' + database"
                  :name="index"
            >
              <Button slot="extra" shape="circle" size="small" icon="ios-close" ghost
                      @click.stop="eraseStored(index)"/>
            </Cell>
          </CellGroup>
        </Sider>
        <div>
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
          </Form>
        </div>
      </Layout>
      <div slot="footer">
        <Button type="primary" :loading="modalLoading" @click="doConnect">OK</Button>
      </div>
    </Modal>
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
  .vertical-center-modal{
    display: flex;
    align-items: center;
    justify-content: center;

    .ivu-modal{
      top: 0;
    }
  }

  .ivu-form-item {
    margin-bottom: 12px;
  }

  #historyList {
    background: #fafafa;
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  form {
    padding: 10px 0;
  }
</style>
