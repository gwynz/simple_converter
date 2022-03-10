import Vue from 'vue'
import App from './App.vue'

// global styles, Tailwindcss
import './styles'

// global mixins
import "@/mixins";

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
