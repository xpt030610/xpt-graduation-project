<template>
    <div class="home">
        <!-- 导航栏 -->
        <navbar :noticeList="noticeList" :repairList="repairList" @showForm="handleShowForm" />
        <!-- 容器组件 -->
        <container />
        <add-dorm-form v-if="showAddDormForm" @showForm="handleShowForm" />
        <notice v-if="showNoticeBox" :noticeList="noticeList" @showForm="handleShowForm" />
        <room v-if="isRoom" />
    </div>
</template>

<script setup>
import navbar from '../components/navbar.vue';
import container from '../components/container.vue';
import addDormForm from '../components/addDormForm.vue';
import notice from '../components/notice.vue';
import room from '../components/room.vue';
import { ref, onMounted, computed } from 'vue';

import { jwtDecode } from 'jwt-decode';
import { useStore } from '../stores';
const Store = useStore();
const noticeList = computed(() => Store.noticeList);
const repairList = computed(() => Store.repairList);
const isRoom = computed(() => Store.isRoom);

const getUserInfo = () => {
    Store.setUserInfo({}); // 初始化用户信息
    const token = localStorage.getItem("access_token");
    if (token) {
        const userInfo = {};
        const decoded = jwtDecode(token);
        userInfo.userName = decoded.userName || '未知用户';
        userInfo.userId = decoded.userId || '未知学号';
        userInfo.roomId = decoded.roomId || '';
        userInfo.role = decoded.role === 'student' ? '学生' : "管理员";
        Store.setUserInfo(userInfo);
    }
};

const showAddDormForm = ref(false); // 控制添加宿舍表单的显示状态
const handleShowForm = (type, value) => {
    if (type === 'addDorm') {
        showAddDormForm.value = value; // 显示添加宿舍表单
    } else if (type === 'notice') {
        showNoticeBox.value = value; // 显示通知列表
    }
};

const showNoticeBox = ref(false); // 控制通知列表的显示状态

onMounted(() => {
    getUserInfo();
    Store.getNoticeList()
    Store.getRepairList()
});
</script>

<style scoped>
.home {
    background: linear-gradient(135deg, #1e1e2f, #121212);
    overflow: hidden;
}
</style>