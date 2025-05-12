<template>
    <div class="home">
        <!-- 导航栏 -->
        <Navbar :userInfo="userInfo" :noticeList="noticeList" @showForm="handleShowForm" />
        <!-- 容器组件 -->
        <container :userInfo="userInfo" />
        <add-dorm-form v-if="showAddDormForm" :userInfo="userInfo" @showForm="handleShowForm" />
        <notice v-if="showNoticeBox" :noticeList="noticeList" @showForm="handleShowForm" />
    </div>
</template>

<script setup>
import Navbar from '../components/navbar.vue';
import container from '../components/container.vue';
import addDormForm from '../components/addDormForm.vue';
import notice from '../components/notice.vue';
import { ref, onMounted } from 'vue';

import { jwtDecode } from 'jwt-decode';

import Axios from '../utils/axios';

const userInfo = ref({
    userName: '未知用户',
    userId: '未知学号',
    roomId: '',
    role: '学生',
});

const getUserInfo = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
        const decoded = jwtDecode(token);
        console.log('解码后的用户信息:', decoded);
        userInfo.value.userName = decoded.userName || '未知用户';
        userInfo.value.userId = decoded.userId || '未知学号';
        userInfo.value.roomId = decoded.roomId || '';
        userInfo.value.role = decoded.role === 'student' ? '学生' : "管理员";
    }
};
const noticeList = ref([]); // 存储通知列表
const getNoticeList = async () => {
    const response = await Axios.post('/dorm/getMemberNotices', {
        userId: userInfo.value.userId,
    });
    noticeList.value = response.data;
    console.log('获取通知列表:', response.data);
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
const handleShowNotice = (value) => {
    showNoticeBox.value = value; // 显示通知列表
};
onMounted(() => {
    getUserInfo();
    getNoticeList();
});
</script>

<style scoped>
.home {
    background: linear-gradient(135deg, #1e1e2f, #121212);
    overflow: hidden;
}
</style>