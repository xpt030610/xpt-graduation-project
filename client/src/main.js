import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// 从 localStorage 中获取 token
const token = localStorage.getItem("access_token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
}

const app = createApp(App);

app.use(router);

app.mount("#app");

