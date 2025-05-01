<template>
    <div class="home">
        <!-- 导航栏 -->
        <Navbar title="三维宿舍管理智能化管理平台" />
        <!-- 容器组件 -->
        <container />
    </div>
</template>

<script setup>
import Navbar from '../components/navbar.vue';
import container from '../components/container.vue';
</script>

<style scoped>
.home {
    background: linear-gradient(135deg, #1e1e2f, #121212);
}
</style>