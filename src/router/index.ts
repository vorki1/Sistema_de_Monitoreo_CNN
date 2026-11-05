import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/areas'
  },
  {
    path: '/areas',
    name: 'areas',
    component: () => import('../instrumentos/views/AreasView.vue')
  },
  {
    path: '/treemap',
    name: 'treemap',
    component: () => import('../instrumentos/views/TreemapView.vue')
  },
  {
    path: '/areas/:area',
    name: 'subareas',
    component: () => import('../instrumentos/views/SubareasView.vue')
  },
  {
    path: '/areas/:area/subareas/:subarea',
    name: 'sistemas',
    component: () => import('../instrumentos/views/SistemasView.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../instrumentos/views/DashboardView.vue')
  },
  {
    path: '/instrumento/:id',
    name: 'detalle-instrumento',
    component: () => import('../instrumentos/views/InformacionInstrumento.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/areas'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router