<template>
  <div id="wrapper">
    <main>
      <div class="left-side">
        <Modal
                v-model="modalInfoDisplay"
                title="Connect to a MySQL server"
                ref="modalInfo"
                :loading="true"
                :mask-closable="false"
                :closable="false"
                class-name="vertical-center-modal"
                @on-ok="doConnect">
          <Form ref="form" :model="inputConfig" :rules="formRules" :label-width="100">
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
          </Form>
        </Modal>
      </div>
    </main>
  </div>
</template>

<script>
  import {mapActions, mapState} from 'vuex'

  export default {
    name: 'LandingPage',
    components: {},
    computed: {
      ...mapState({config: state => state.db.config})
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
          this.$refs.modalInfo.buttonLoading = false
          this.submitConnectionStatus({connected: 'no', errorMessage: ''})
        }
        if (newConfig.connected === 'succeed') {
          this.modalInfoDisplay = false
          this.$router.push('/dashboard/')
        }
      }
    },
    mounted () {
      // this.$refs['modalInfo'].$emit('on-ok') // auto connect in development env
    },
    data () {
      return {
        modalInfoDisplay: true,
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
          ],
          username: [
            {required: true, trigger: 'blur'}
          ],
          password: [
            {required: false, trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      ...mapActions(['submitConfig', 'submitConnectionStatus']),
      doConnect () {
        this.submitConfig(this.inputConfig)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .vertical-center-modal {
    display: flex;
    align-items: center;
    justify-content: center;

    .ivu-modal {
      top: 0;
    }
  }
</style>
