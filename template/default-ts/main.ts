import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

const app = new (typeof App === 'object' ? Vue.extend(Object.assign({ mpType: 'app' }, App)) : App)
app.$mount();
