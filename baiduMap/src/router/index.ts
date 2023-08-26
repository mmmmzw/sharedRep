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
    },
    component: () =>
      import(
        /* webpackChunkName: "BaiDuMapDemo1" */ "@/views/BaiDuMapDemo1/index.vue"
      ),
  },
  {
    path: "/BigEye",
    name: "BigEye",
    meta: {
      title: "大眼",
    },
    component: () =>
      import(
        /* webpackChunkName: "BigEye" */ "@/views/BigEye/index.vue"
      ),
  },
  {
    path: "/BaiDuMapDemo2",
    name: "BaiDuMapDemo2",
    meta: {
      title: "百度地图Demo2",
    },
    component: () =>
      import(
        /* webpackChunkName: "BaiDuMapDemo2" */ "@/views/BaiDuMapDemo2/index.vue"
      ),
  },
  {
    path: "/threejs",
    name: "threejs",
    meta: {
      title: "百度地图Demo2",
    },
    component: () =>
      import(
        /* webpackChunkName: "threejs" */ "@/views/threejs/demo.vue"
      ),
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
