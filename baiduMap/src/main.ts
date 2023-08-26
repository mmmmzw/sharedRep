import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import "@/style/common.css"
const app = createApp(App); // vue实例

app.use(router); // 注册路由
app.mount("#app"); // 挂载vue节点
app.provide("$isDev" , process.env.NODE_ENV === 'development')