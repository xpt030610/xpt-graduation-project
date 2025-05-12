import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    isAdmin: false, // 是否是管理员
    userInfo: {}, // 用户信息
  }),
  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
      this.isAdmin = userInfo.role === "管理员"; // 根据角色设置 isAdmin
      console.log("pinia userInfo", this.userInfo);
      console.log("pinia isAdmin", this.isAdmin);
    },
  },
});
export const useTokenStore = defineStore("token", {
  state: () => ({
    token: null, // token
  }),
  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem("access_token", token); // 将 token 存储到 localStorage
    },
    removeToken() {
      this.token = null;
      localStorage.removeItem("access_token"); // 移除 localStorage 中的 token
    },
  },
});
