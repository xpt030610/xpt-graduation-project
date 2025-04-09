<template>
    <div class="login-page">
        <!-- Three.js 动态背景 -->
        <div id="threejs-background"></div>

        <!-- 登录卡片 -->
        <div class="login-container">
            <!-- 左侧 iOS 风格 UI -->
            <div class="login-left">
                <h2>三维宿舍管理系统</h2>
                <p>管理您的宿舍，轻松高效。</p>
                <ul>
                    <li>实时查看宿舍状态</li>
                    <li>快速报修设备问题</li>
                    <li>便捷的学生管理功能</li>
                </ul>
            </div>

            <!-- 右侧登录表单 -->
            <div class="login-right">
                <div class="login-header">
                    <h1>欢迎登录</h1>
                    <p class="subtitle">请使用您的账户信息登录</p>
                </div>
                <form @submit.prevent="handleClick" class="login-form">
                    <div class="input-group">
                        <label for="username">学号</label>
                        <input id="username" v-model="userId" type="text" placeholder="请输入学号" required />
                    </div>
                    <div v-if="!isLogin" class="input-group">
                        <label for="userName">姓名</label>
                        <input id="userName" v-model="userName" type="userName" placeholder="请输入姓名" required />
                    </div>
                    <div class="input-group">
                        <label for="password">密码</label>
                        <input id="password" v-model="password" type="password" placeholder="请输入密码" required />
                    </div>
                    <button type="submit" class="login-button">登录</button>
                    <div class="login-footer">
                        <div v-if="isLogin" @click="() => { isLogin = false }">注册新账户</div>
                        <div v-if="!isLogin" @click="() => { isLogin = true }">已有账户</div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as THREE from 'three';
import axios from 'axios';
import router from '../router';
import { MessagePlugin } from 'tdesign-vue-next';

const isLogin = ref(true);
const userId = ref('');
const userName = ref('');
const password = ref('');

const handleClick = async () => {
    if (isLogin.value) {
        await handleLogin();
    } else {
        await handleRegister();
    }

};

const handleRegister = async () => {
    try {
        const response = await axios.post('/users/create', {
            userId: userId.value,
            userName: userName.value,
            password: password.value,
            role: 'student'
        });
        console.log('注册成功:', response);
        MessagePlugin.success('注册成功，请登录');
        isLogin.value = true;
    } catch (error) {
        console.error('注册失败:', error, error.response.data.message);
        MessagePlugin.error('注册失败：' + (error.response?.data?.message || '未知错误'));
    }
}

const handleLogin = async () => {
    try {
        const response = await axios.post('/users/login', {
            userId: userId.value,
            password: password.value
        });
        // 特殊情况：用户账户未注册
        if (response.data.shouldRegister) {
            isLogin.value = false;
            MessagePlugin.info('用户不存在，请注册');
            return;
        }
        console.log('登录成功:', response);
        MessagePlugin.success('登录成功');
        const token = response.data.access_token;
        // 将 token 存储到 localStorage
        localStorage.setItem('access_token', token);
        // 设置 Axios 默认 Authorization 头
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // 跳转到首页
        router.push('/');
    } catch (error) {
        console.error('登录失败:', error);
        MessagePlugin.error('登录失败：' + (error.response?.data?.message || '未知错误'));
    }
};

onMounted(() => {
    // 初始化 Three.js 场景
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('threejs-background').appendChild(renderer.domElement);

    // 创建圆角矩形纹理（支持多种颜色）
    const createRoundedRectTexture = (width, height, radius, colors) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // 创建渐变颜色
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, colors[0]); // 起始颜色
        gradient.addColorStop(1, colors[1]); // 结束颜色

        // 绘制圆角矩形
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(width - radius, 0);
        ctx.quadraticCurveTo(width, 0, width, radius);
        ctx.lineTo(width, height - radius);
        ctx.quadraticCurveTo(width, height, width - radius, height);
        ctx.lineTo(radius, height);
        ctx.quadraticCurveTo(0, height, 0, height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();

        return new THREE.CanvasTexture(canvas);
    };

    // 创建粒子材质数组（每个粒子使用不同的颜色）
    const materials = [];
    const colorPalettes = [
        ['#007aff', '#4a90e2'], // 蓝色渐变
        ['#ff5e57', '#ff2d55'], // 红色渐变
        ['#34c759', '#30d158'], // 绿色渐变
        ['#ffcc00', '#ffd60a'], // 黄色渐变
        ['#5856d6', '#5e5ce6'], // 紫色渐变
    ];

    for (const colors of colorPalettes) {
        const texture = createRoundedRectTexture(128, 128, 32, colors);
        const material = new THREE.PointsMaterial({
            size: Math.random() * 2 + 1,
            map: texture,
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
        });
        materials.push(material);
    }

    // 创建粒子系统
    const particlesCount = 300;

    // 粒子位置数据
    const positions = new Float32Array(particlesCount * 3);
    const particles = new THREE.Group(); // 使用 Group 管理多个粒子系统

    for (let i = 0; i < particlesCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50; // X
        positions[i * 3 + 1] = (Math.random() - 0.5) * 30; // Y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50; // Z

        // 随机选择材质
        const material = materials[Math.floor(Math.random() * materials.length)];

        // 创建单个粒子
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions.slice(i * 3, i * 3 + 3), 3));
        const particle = new THREE.Points(particleGeometry, material);

        particles.add(particle);
    }

    scene.add(particles);

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 设置相机位置
    camera.position.z = 50;

    // 动画循环
    const animate = () => {
        requestAnimationFrame(animate);

        // 粒子缓慢旋转
        particles.rotation.y += 0.001;

        renderer.render(scene, camera);
    };

    animate();

    // 窗口大小调整
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
</script>

<style scoped>
/* 整体页面布局 */
.login-page {
    position: relative;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    background: linear-gradient(135deg, #1e1e2f, #121212);
    /* 深色渐变背景 */
}

/* Three.js 背景容器 */
#threejs-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

/* 登录卡片 */
.login-container {
    position: relative;
    z-index: 2;
    display: flex;
    max-width: 800px;
    width: 90%;
    padding: 30px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.9));
    /* 渐变背景 */
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    /* 阴影效果 */
    backdrop-filter: blur(20px);
    /* 毛玻璃效果 */
    animation: card-breathing 4s infinite ease-in-out;
    /* 优雅的呼吸动效 */
    color: white;
}

/* 优雅的呼吸动效 */
@keyframes card-breathing {
    0% {
        transform: scale(1);
        /* 初始大小 */
        opacity: 1;
        /* 初始透明度 */
    }

    50% {
        transform: scale(1.02);
        /* 轻微放大 */
        opacity: 0.95;
        /* 轻微透明 */
    }

    100% {
        transform: scale(1);
        /* 恢复原始大小 */
        opacity: 1;
        /* 恢复原始透明度 */
    }
}

/* 左侧内容 */
.login-left {
    flex: 1;
    padding: 20px;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.login-left h2 {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
}

.login-left p {
    font-size: 14px;
    color: #aaa;
    margin-bottom: 20px;
}

.login-left ul {
    list-style: none;
    padding: 0;
}

.login-left ul li {
    display: flex;
    align-items: center;
    font-size: 14px;
    margin-bottom: 10px;
    position: relative;
    padding-left: 20px;
}

.login-left ul li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #007aff;
    /* iOS 蓝色 */
    font-size: 18px;
}

/* 右侧内容 */
.login-right {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    border-radius: 16px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 标题部分 */
.login-header h1 {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #ffffff;
}

.login-header .subtitle {
    font-size: 14px;
    color: #aaa;
    margin-bottom: 20px;
}

/* 表单部分 */
.login-form {
    width: 100%;
    max-width: 300px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.input-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
}

.input-group label {
    font-size: 14px;
    color: #ddd;
    margin-bottom: 5px;
}

.input-group input {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    outline: none;
    transition: all 0.3s ease;
}

.input-group input:focus {
    border-color: #007aff;
    box-shadow: 0 0 8px rgba(0, 122, 255, 0.5);
}

/* 登录按钮 */
.login-button {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    font-weight: bold;
    color: white;
    background: linear-gradient(90deg, #007aff, #0051ff);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s ease;
}

.login-button:hover {
    background: linear-gradient(90deg, #0051ff, #007aff);
    transform: scale(1.02);
}

.login-button:active {
    background: linear-gradient(90deg, #003bb3, #0047d1);
    transform: scale(0.98);
}

/* 底部链接 */
.login-footer {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.login-footer div {
    font-size: 14px;
    color: #007aff;
    cursor: pointer;
    transition: color 0.3s ease;
}

.login-footer div:hover {
    color: #0051ff;
}
</style>
