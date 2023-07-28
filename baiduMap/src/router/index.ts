import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: "/BaiDuMapDemo1",
    name: "BaiDuMapDemo1",
    meta: {
      title: "百度地图Demo1",
      hide: true,
      noNeedToken: true,
      noNeedCompanyToken: true,
    },
    component: () =>
      import(
        /* webpackChunkName: "BaiDuMapDemo1" */ "@/views/BaiDuMapDemo1/index.vue"
      ),
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
