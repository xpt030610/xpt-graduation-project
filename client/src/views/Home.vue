<template>
    <div class="home">
        <!-- 导航栏 -->
        <Navbar :noticeList="noticeList" @showForm="handleShowForm" />
        <!-- 容器组件 -->
        <container />
        <add-dorm-form v-if="showAddDormForm" @showForm="handleShowForm" />
        <notice v-if="showNoticeBox" :noticeList="noticeList" @showForm="handleShowForm" />
    </div>
</template>

<script setup>
import Navbar from '../components/navbar.vue';
import container from '../components/container.vue';
import addDormForm from '../components/addDormForm.vue';
import notice from '../components/notice.vue';
import { ref, onMounted, computed } from 'vue';

import { jwtDecode } from 'jwt-decode';

// import Axios from '../utils/axios';
import { useStore } from '../stores';
const Store = useStore();
const noticeList = computed(() => Store.noticeList);

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
// const noticeList = ref([]); // 存储通知列表
// const getNoticeList = async () => {
//     const userInfo = Store.userInfo;
//     const response = await Axios.post('/dorm/getMemberNotices', {
//         userId: userInfo.userId,
//     });
//     noticeList.value = response.data;
//     console.log('获取通知列表:', response.data);
// };

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
});
</script>

<style scoped>
.home {
    background: linear-gradient(135deg, #1e1e2f, #121212);
    overflow: hidden;
}
</style>