// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from './App'
import router from './router'
import VueLocalStorage from 'vue-localstorage'
import store from './store'
// import SocketIO from 'socket.io'
// import VueSocketIO from 'vue-socket.io'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
// const SocketInstance = SocketIO('http://localhost:3000/chat', {wsEngine: 'ws'})

Vue.use(BootstrapVue)
Vue.use(VueLocalStorage)
// Vue.use(VueSocketIO, SocketInstance)

Vue.config.productionTip = false
Vue.prototype.$hostname = (Vue.config.productionTip) ? 'https://www.your-api.com' : 'http://localhost:3000'

Vue.config.debug = true

/* eslint-disable no-new */
new Vue({
  beforeCreate: function () {
    console.log(this.$hostname)
  },
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
