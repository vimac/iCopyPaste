import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import ViewUI from 'view-design'
import enUS from 'view-design/dist/locale/en-US'
import SequelizeBridge from './util/SequelizeBridge'
import DotBridge from './util/DotBridge'
import 'view-design/dist/styles/iview.css'
import 'vue-code-highlight/themes/prism-tomorrow.css'
import './assets/main.css'

import VueCodeHighlight from 'vue-code-highlight/dist/vue-code-highlight.esm'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(ViewUI, {locale: enUS})
Vue.use(SequelizeBridge)
Vue.use(VueCodeHighlight)
Vue.use(DotBridge)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
