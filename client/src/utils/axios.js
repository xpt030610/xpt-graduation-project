import axios from "axios";
import router from "../router"; // 引入 Vue Router 实例
import { MessagePlugin } from "tdesign-vue-next";

// 创建 axios 实例
const Axios = axios.create({
  timeout: 10000, // 请求超时时间
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
Axios.interceptors.request.use(
  (config) => {
    // 在请求头中添加 Token
    const token = localStorage.getItem("access_token"); // 从 localStorage 中获取 Token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
Axios.interceptors.response.use(
  (response) => {
    // 如果响应成功，直接返回数据
    return response.data;
  },
  (error) => {
    // 如果响应失败，处理错误
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        // 如果状态码是 401，表示 Token 过期
        MessagePlugin.error("Token 已过期，请重新登录");
        localStorage.removeItem("access_token"); // 清除本地存储的 Token
        router.push("/login"); // 跳转到登录页
      }
    }
    return Promise.reject(error);
  }
);

export default Axios;
