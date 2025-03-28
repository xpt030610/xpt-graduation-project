<template>
    <div>
        <h1>欢迎来到主页</h1>
        <p>这是一个简单的 Vue 3 应用。</p>
        <container />
    </div>
</template>

<script setup>
import container from '../components/container.vue';
</script>

<style scoped>
h1 {
    text-align: center;
    margin-top: 50px;
}
</style>