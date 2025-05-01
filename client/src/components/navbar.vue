<template>
    <div class="navbar">
        <!-- 左侧标题 -->
        <div class="navbar-left">
            <h1>{{ title }}</h1>
        </div>
        <!-- 右侧功能按钮 -->
        <div class="navbar-right">
            <button class="icon-button" @click="onNotificationClick">
                <div class="icon-notification">消息通知</div> <!-- 消息通知图标 -->
            </button>
            <button class="icon-button" @click="onProfileClick">
                <div class="icon-profile">个人信息</div> <!-- 个人信息图标 -->
            </button>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// 接收标题作为属性
defineProps({
    title: {
        type: String,
        default: '导航栏', // 默认标题
    },
});

// 定义事件，用于向父组件传递按钮点击事件
const emit = defineEmits(['notificationClick', 'profileClick']);

// 消息通知按钮点击事件
const onNotificationClick = () => {
    emit('notificationClick');
};

// 个人信息按钮点击事件
const onProfileClick = () => {
    emit('profileClick');
};
</script>

<style scoped>
/* 导航栏样式 */
.navbar {
    position: fixed;
    top: 0;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 15px 20px;
    border-radius: 16px;
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
    transform: scale(1.1);
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
</style>