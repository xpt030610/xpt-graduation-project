<template>
    <div class="home">
        <!-- 导航栏 -->
        <Navbar :userInfo="userInfo" @showForm="handleShowForm" />
        <!-- 容器组件 -->
        <container />
        <add-dorm-form v-if="showAddDormForm" :userInfo="userInfo" @showForm="handleShowForm" />
    </div>
</template>

<script setup>
import Navbar from '../components/navbar.vue';
import container from '../components/container.vue';
import addDormForm from '../components/addDormForm.vue';

import { ref } from 'vue';

import { jwtDecode } from 'jwt-decode';
const accessToken = localStorage.getItem("access_token"); // 从后端获取的 JWT
const userInfo = ref({
    userName: '未知用户',
    userId: '未知学号',
    roomId: '',
    role: '学生',
});

try {
    const decoded = jwtDecode(accessToken);
    console.log('解析后的 JWT:', decoded);
    userInfo.value.userName = decoded.userName || '未知用户';
    userInfo.value.userId = decoded.userId || '未知学号';
    userInfo.value.roomId = decoded.roomId || '';
    userInfo.value.role = decoded.role === 'student' ? '学生' : "管理员";
} catch (error) {
    console.error('JWT 解析失败:', error);
}

const showAddDormForm = ref(false); // 控制添加宿舍表单的显示状态

const handleShowForm = (type, value) => {
    if (type === 'addDorm') {
        showAddDormForm.value = value; // 显示添加宿舍表单
    }
};

</script>

<style scoped>
.home {
    background: linear-gradient(135deg, #1e1e2f, #121212);
}
</style>