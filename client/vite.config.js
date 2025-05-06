import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import { TDesignResolver } from "unplugin-vue-components/resolvers";

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        TDesignResolver({
          library: "vue-next",
        }),
      ], // 配置 TDesign 按需引入
    }),
    AutoImport({
      resolvers: [
        TDesignResolver({
          library: "vue-next",
        }),
      ], // 自动引入 TDesign 相关 API
    }),
  ],
  server: {
    proxy: {
      "/users": {
        target: "http://localhost:3000", // 目标服务器地址
        changeOrigin: true, // 是否改变请求源
        rewrite: (path) => path.replace(/^\/users/, "/users"), // 可选：重写路径
      },
      "/dorm": {
        target: "http://localhost:3000", // 目标服务器地址
        changeOrigin: true, // 是否改变请求源
        rewrite: (path) => path.replace(/^\/dorm/, "/dorm"), // 可选：重写路径
      },
    },
  },
});

