import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  plugins: [glsl()], // 添加GLSL支持
  server: {
    port: 3000, // 指定前端端口
  },
});
