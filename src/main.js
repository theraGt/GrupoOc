import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import App from './App.vue'
import router from './router'
import './theme/base.css'
import './theme/oc-fonts.css'

const app = createApp(App).use(IonicVue, { mode: 'md' }).use(router)
router.isReady().then(() => app.mount('#app'))
