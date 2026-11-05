import { createRouter, createWebHistory } from '@ionic/vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/oc' },
    { path: '/oc', name: 'oc', component: () => import('../views/OcPage.vue') },
    { path: '/oc/propiedades/terreno-villa-nueva', name: 'oc-land', component: () => import('../views/OcLandPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.afterEach(to => {
  const description = document.querySelector('meta[name="description"]')
  if (description) description.content = 'OC Grupo Inmobiliario. Un recorrido por nuevas formas de vivir e invertir en Guatemala.'
  if (to.name === 'oc-land') {
    document.title = 'El Cortijo · Terreno 9,911.56 m² en Villa Nueva | OC Grupo Inmobiliario'
    if (description) description.content = 'Terreno de 9,911.56 m² en Colonia El Cortijo, Villa Nueva. 149 m de frente sobre calle principal y pozo propio con bomba.'
    return
  }
  document.title = 'OC Grupo Inmobiliario · Una nueva perspectiva'
})
export default router
