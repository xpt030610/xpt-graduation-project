import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Home from "../views/Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { requiresAuth: true }, // 需要登录
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false }, // 不需要登录
    key: "login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 模拟登录状态（实际项目中可以从 Vuex 或 LocalStorage 获取）
const isAuthenticated = () => {
  return localStorage.getItem("access_token"); // 假设登录后会存储 token
};

// 全局导航守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    // 如果目标路由需要登录且未登录，则跳转到登录页
    next({ path: "/login" });
  } else {
    // 否则允许进入目标路由
    console.log("Navigating to:", to.name);
    console.log("From:", from.name);
    next();
  }
});

export default router;
