<template>
    <div class="navbar">
        <!-- 左侧标题 -->
        <div class="navbar-left">
            <h1>三维宿舍管理智能化管理平台</h1>
        </div>
        <!-- 右侧功能按钮 -->
        <div class="navbar-right">
            <button class="icon-button" @click="onNotificationClick">
                <div class="icon-notification">消息通知</div> <!-- 消息通知图标 -->
            </button>

            <div class="profile-container" @mouseenter="showProfileBox = true" @mouseleave="showProfileBox = false">
                <div class="icon-button">
                    <div class="icon-profile">个人信息</div> <!-- 个人信息图标 -->
                </div>
                <transition name="fade">
                    <div v-if="showProfileBox" class="profile-box">
                        <p>用户名: {{ userInfo.userName }}</p>
                        <p>学号: {{ userInfo.userId }}</p>
                        <p>角色：{{ userInfo.role }}</p>
                        <p>宿舍：{{ userInfo.roomId || '未加入宿舍' }}</p>
                        <button class="primary" v-if="userInfo.roomId" @click="addRoom">加入宿舍</button>
                        <button @click="logout">退出登录</button>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref, defineEmits } from 'vue';

import router from '../router';

const emit = defineEmits(['showForm']);
const props = defineProps({
    userInfo: {
        type: Object
    },
});

// 控制个人信息弹出框的显示状态
const showProfileBox = ref(false);


const addRoom = () => {
    // 处理加入宿舍的逻辑
    console.log('加入宿舍:', userInfo.value.roomId);
    emit('showForm', 'addDorm', true);
    // 这里可以添加实际的加入宿舍逻辑
};

const logout = () => {
    localStorage.removeItem("access_token"); // 清除 JWT
    router.push('/login'); // 跳转到登录页面
};
</script>

<style scoped lang="less">
/* 导航栏样式 */
.navbar {
    position: fixed;
    top: 0;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 15px 20px;
    border-radius: 0 0 8px 8px;
    background: rgba(0, 0, 0, 0.8);
    /* 增加背景不透明度 */
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
    /* 更明显的阴影效果 */
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    /* 添加浅色底部边框 */
    animation: card-breathing 4s infinite ease-in-out;
    color: white;
}

/* 优雅的呼吸动效 */
@keyframes card-breathing {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.95;
    }

    100% {
        opacity: 1;
    }
}

/* 左侧标题样式 */
.navbar-left h1 {
    font-size: 20px;
    font-weight: 600;
    color: #fff;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 右侧功能按钮容器 */
.navbar-right {
    display: flex;
    gap: 10px;
    /* 按钮之间的间距 */
}

/* 功能按钮样式 */
.icon-button {
    background: none;
    /* 无背景 */
    border: none;
    /* 无边框 */
    color: #fff;
    /* 按钮文字颜色 */
    font-size: 18px;
    cursor: pointer;
    transition: transform 0.2s ease, opacity 0.2s ease;
    margin: 0 15px;
}

.icon-button:hover {
    transform: scale(1.03);
    /* 鼠标悬停放大效果 */
    opacity: 0.8;
    /* 鼠标悬停透明度变化 */
}

/* 图标样式 */
.icon-notification::before {
    content: '🔔';
    /* 消息通知图标 */
}

.icon-profile::before {
    content: '👤';
    /* 个人信息图标 */
}


/* 进入和离开动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
    /* 向上移动 */
}

/* 个人信息弹出框容器 */
.profile-container {
    position: relative;
    display: flex;
    align-items: center;
    margin: -15px 0;

    /* 个人信息弹出框样式 */
    .profile-box {
        position: absolute;
        top: 58px;
        right: -20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        border-radius: 0 0 8px 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        width: 200px;
        padding: 15px 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-top: 0;

        p {
            margin-bottom: 10px;
            font-size: 14px;
        }

        button {
            background: #ff4d4f;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            width: 100%;
            text-align: center;
            margin-top: 10px;
            transition: background 0.3s ease;

            &:hover {
                background: #d9363e;
            }

            &.primary {
                background: #1890ff;
            }

            &.primary:hover {
                background: #40a9ff;
            }

        }
    }
}
</style>