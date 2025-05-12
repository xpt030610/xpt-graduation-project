<template>
    <div class="wrapper">
        <div ref="threeContainer" class="three-container"></div>
        <button class="btn" @click="focusOnDetail">宿舍内饰图</button>
        <button class="btn" @click="focusOnTop">俯视图</button>
    </div>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from 'gsap';

import { ref, onMounted } from 'vue';
import { useStore } from '../stores';
import Axios from '../utils/axios';
import { MessagePlugin } from 'tdesign-vue-next';

const threeContainer = ref(null);
let camera;
let controls;

const focusOnDetail = () => {
    // 对准模型
    camera.position.set(2.76, 1.43, -11.39); // 设置相机位置
    camera.lookAt(-0.243, -0.220, 0.944); // 设置相机朝向
}

const focusOnTop = () => {
    // 使用 gsap 平滑移动相机位置
    gsap.to(camera.position, {
        x: 1.9994,
        y: 5.6595,
        z: -11.2219,
        duration: 1, // 动画持续时间（秒）
        ease: 'power2.out', // 缓动效果
        onUpdate: () => {
            // 在动画过程中实时更新 OrbitControls
            controls.update();
        },
    });

    // 使用 gsap 平滑移动 OrbitControls 的目标点
    gsap.to(controls.target, {
        x: 1.9744,
        y: -8.2624,
        z: -7.3521,
        duration: 1, // 动画持续时间（秒）
        ease: 'power2.out',
        onUpdate: () => {
            controls.update();
        },
    });
    debugCamera()
}

const debugCamera = () => {
    console.log("当前相机位置:", camera.position);  // 输出三维坐标(x,y,z)
    console.log("当前朝向向量:", camera.getWorldDirection());  // 归一化方向向量
    console.log("当前旋转角度(弧度):", camera.rotation);  // 欧拉角(x,y,z)
};

onMounted(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101010);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.localClippingEnabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    threeContainer.value.appendChild(renderer.domElement);

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // 环境光，降低强度
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // 方向光
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // 加载模型
    const loader = new GLTFLoader();
    loader.load('/src/assets/room.glb', (gltf) => {
        // 自动切割所有建筑
        const model = gltf.scene;
        console.log('模型:', model);
        model.scale.set(0.1, 0.1, 0.1); // 调整模型大小
        model.position.set(0, 0, 0); // 设置模型位置
        // 对准模型
        camera.position.set(2, 6, -11); // 设置相机位置
        camera.lookAt(0.01, -0.84, 0.53); // 设置相机朝向
        scene.add(model);
        console.log('模型加载完成:', scene);
    },
        (xhr) => {
            console.log(`模型加载进度: ${(xhr.loaded / xhr.total) * 100}%`);
        },
        (error) => {
            console.error('模型加载失败:', error);
        }
    );
    // 添加 OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 启用阻尼效果（惯性）
    controls.dampingFactor = 0.05; // 阻尼系数
    controls.screenSpacePanning = false; // 禁止屏幕平移
    controls.minDistance = 1; // 设置最小缩放距离
    controls.maxDistance = 50; // 设置最大缩放距离
    controls.maxPolarAngle = Math.PI / 2; // 限制垂直旋转角度（防止翻转）

    controls.addEventListener('change', () => {
        console.log("交互调整后的相机位置:", camera.position);
        console.log("目标点:", controls.target);  // 相当于lookAt的坐标
    });
    // 禁用交互
    // controls.enabled = false;

    // 动画循环
    const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    };
    animate();

    // 窗口大小调整事件
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
</script>
<style scoped lang="less">
.wrapper {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    z-index: 10;

    .btn {
        position: absolute;
        right: 20px;
        top: 80px;
    }
}
</style>