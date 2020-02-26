import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import ViewUI from 'view-design'
import enUS from 'view-design/dist/locale/en-US'
import {sequelizeBridgeInstaller} from './util/SequelizeBridge'
import {modelGeneratorInstaller} from './generator/ModelGenerator'
import {generatorInstaller} from './generator/GeneratorUtil'
import 'view-design/dist/styles/iview.css'
import './assets/main.css'
import 'prism-es6/components/prism-sql'
import 'prism-es6/components/prism-markup-templating'
import 'prism-es6/components/prism-php'
import 'vue-code-highlight/themes/prism-tomorrow.css'

import VueCodeHighlight from 'vue-code-highlight/dist/vue-code-highlight.esm'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(ViewUI, {locale: enUS})
Vue.use(sequelizeBridgeInstaller)
Vue.use(VueCodeHighlight)
Vue.use(modelGeneratorInstaller)
Vue.use(generatorInstaller)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
