import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import axios from "axios";

import "tdesign-vue-next/es/style/index.css"; // 引入 TDesign 样式

// 从 localStorage 中获取 token
const token = localStorage.getItem("access_token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

const app = createApp(App);

app.use(router);

app.mount("#app");

