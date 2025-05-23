<template>
    <div class="wrapper">
        <div ref="threeContainer" class="three-container"></div>
        <div v-if="roomInfo" class="room-info-box">
            <h3>房间信息</h3>
            <div><strong>房间:</strong> {{ roomInfo.roomId }}</div>
            <div :class="{ error: isError('temperature') }"><strong>温度:</strong> {{ roomInfo.temperature }}°C</div>
            <div :class="{ error: isError('humidity') }"><strong>湿度:</strong> {{ roomInfo.humidity }}%</div>
            <div :class="{ error: isError('smoke') }"><strong>烟雾浓度:</strong> {{ roomInfo.smoke }}%</div>
            <div v-if="roomInfo.members">
                <strong>用户成员:</strong>
                <div v-for="member in roomInfo.members">{{ member.userName }}</div>
            </div>
        </div>
        <div class="btns">
            <button class="btn" @click="focusOnDetail">宿舍内饰图</button>
            <button class="btn" @click="focusOnTop">俯视图</button>
            <button class="btn" @click="showObjectBtns = true">报修设备</button>
            <!-- 新增：设备选择按钮容器 -->
            <div v-if="showObjectBtns" class="objectBtns">
                <button class="btn small" @click="showObject('air')">空调</button>
                <button class="btn small" @click="showObject('water')">饮水机</button>
                <button class="btn small" @click="showObject('door')">大门</button>
                <button class="btn small" @click="showObject('window')">窗户</button>
                <button class="btn small" @click="showObject('table')">椅子</button>
                <button class="btn small eqit" @click="showObjectBtns = false">取消</button>
            </div>
            <button class="btn eqit" @click="eqit">退出</button>
        </div>
        <fix-form v-if="showFixForm" :type="objectType" @close="showFixForm = false" />

    </div>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from 'gsap';
import fixForm from './fixForm.vue';
import { ref, onMounted, computed } from 'vue';
import Axios from '../utils/axios';
import { MessagePlugin } from 'tdesign-vue-next';
import { useStore } from '../stores';
const Store = useStore();
const roomInfo = computed(() => Store.roomInfo)

const threeContainer = ref(null);
let camera;
let controls;
const showObjectBtns = ref(false);
const showFixForm = ref(false)
const objectType = ref("")

const focusOnDetail = () => {
    // 使用 gsap 平滑移动相机位置
    gsap.to(camera.position, {
        x: 2.64,
        y: 1.51,
        z: -11.03,
        duration: 1, // 动画持续时间（秒）
        ease: 'power2.out', // 缓动效果
        onUpdate: () => {
            // 在动画过程中实时更新 OrbitControls
            controls.update();
        },
    });

    // 使用 gsap 平滑移动 OrbitControls 的目标点
    gsap.to(controls.target, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1, // 动画持续时间（秒）
        ease: 'power2.out',
        onUpdate: () => {
            controls.update();
        },
    });
    debugCamera()
}

const focusOnTop = () => {
    // 使用 gsap 平滑移动相机位置
    gsap.to(camera.position, {
        x: 2.10,
        y: 6.22,
        z: -9.77,
        duration: 1, // 动画持续时间（秒）
        ease: 'power2.out', // 缓动效果
        onUpdate: () => {
            // 在动画过程中实时更新 OrbitControls
            controls.update();
        },
    });

    // 使用 gsap 平滑移动 OrbitControls 的目标点
    gsap.to(controls.target, {
        x: 2.12,
        y: -8.26,
        z: -7.36,
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
    // console.log("当前朝向向量:", camera.getWorldDirection());  // 归一化方向向量
    console.log("当前旋转角度(弧度):", camera.rotation);  // 欧拉角(x,y,z)
};

const eqit = () => {
    Store.setRoomInfo()
}

const buildingRefs = ref({})

const showObject = (object) => {
    showFixForm.value = true
    switch (object) {
        case 'table':
            focusOnModel('table', 1, 1, 1)
            break;
        case 'air':
            focusOnModel('air', 1, 1, 1)
            break;
        case 'door':
            focusOnModel('door', -1, 1, 1)
            break;
        case 'window':
            focusOnModel('window', -1.5, 1, -1)
            break;
        case 'water':
            focusOnModel('water', -1, 1, -1)
            break;
        default:
            break;
    }
}

// 让相机对准目标模型
const focusOnModel = (modelName, distance1, distance2, distance3) => {
    objectType.value = modelName;
    const target = buildingRefs.value[modelName];
    console.log("fouces", modelName, buildingRefs.value, target)
    if (target) {
        const boundingBox = new THREE.Box3().setFromObject(target);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());

        // 使用 gsap 平滑移动相机位置
        gsap.to(camera.position, {
            x: center.x + distance1,
            y: center.y + distance2,
            z: center.z + distance3,
            duration: 1, // 动画持续时间（秒）
            ease: 'power2.out', // 缓动效果
            onUpdate: () => {
                // 在动画过程中实时更新 OrbitControls
                controls.update();
            },
        });

        // 使用 gsap 平滑移动 OrbitControls 的目标点
        gsap.to(controls.target, {
            x: center.x,
            y: center.y,
            z: center.z,
            duration: 1, // 动画持续时间（秒）
            ease: 'power2.out',
            onUpdate: () => {
                controls.update();
            },
        });
        console.log(`相机对准模型: ${modelName}`, { center, size });
    } else {
        console.error(`未找到目标对象: ${modelName}`);
    }
};

const isError = (type) => {
    switch (type) {
        case 'temperature':
            return roomInfo.value.temperature < 15 || roomInfo.value.temperature > 30;
        case 'humidity':
            return roomInfo.value.humidity > 70;
        case 'smoke':
            return roomInfo.value.smoke > 50;
    }
}
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
        const buildingsToProcess = [];
        model.traverse(obj => {
            if (obj.isMesh && ['water', 'door', 'table', 'air', 'window'].includes(obj.name)) {
                buildingsToProcess.push(obj);
            }
        });
        // 2. 处理每个建筑对象
        buildingsToProcess.forEach(obj => {
            console.log('处理建筑:', obj);
            buildingRefs.value[obj.name] = obj;
        });
        console.log('模型:', model, buildingRefs.value);
        model.scale.set(0.1, 0.1, 0.1); // 调整模型大小
        model.position.set(0, 0, 0); // 设置模型位置
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

    // controls.addEventListener('change', () => {
    //     console.log("交互调整后的相机位置:", camera.position);
    //     console.log("目标点:", controls.target);  // 相当于lookAt的坐标
    // });
    // 禁用交互
    // controls.enabled = false;
    focusOnTop()
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
    height: 100%;
    overflow: hidden;
    z-index: 11;
    border-radius: 8px;
    background-color: #000;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .room-info-box {
        position: absolute;
        top: 80px;
        /* 距离顶部 */
        right: 20px;
        /* 距离右侧 */
        background: rgba(0, 0, 0, 0.7);
        /* 半透明黑色背景 */
        color: #fff;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        font-size: 14px;
        z-index: 12;
        /* 确保在其他元素之上 */
        pointer-events: none;
        /* 允许鼠标事件穿透，不影响下方交互 */

        h3 {
            margin-top: 0;
            font-size: 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.3);
            padding-bottom: 5px;
            margin-bottom: 10px;
        }

        .error {
            color: #ff0000;
        }

        strong {
            color: #ccc;
            /* 标签颜色稍浅 */
        }
    }

    .btns {
        display: flex;
        flex-direction: column;
        position: absolute;
        left: 20px;
        top: 80px;
        gap: 10px;

        .btn {
            background: #ffffff;
            font-weight: 700;
            color: #333;
            border: 1px solid #333;
            padding: 12px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1);
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
                background: #f0f0f0;
                color: #000;
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
                transform: translateY(-2px);
            }

            &:active {
                background: #e6e6e6;
                color: #000;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1);
                transform: translateY(1px);
            }
        }

        .objectBtns {
            position: absolute;
            width: 80px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            left: 130px;
            top: 15px;

            .small {
                padding: 8px 16px;
                border-radius: 16px;
                cursor: pointer;
                transition: all 0.3s ease
            }
        }

        .eqit {
            // 红色按钮
            background: #ff0000;
            color: #fff;

            &:hover {
                background: #ff0000;
                color: #fff;
                box-shadow: 0 4px 6px rgba(255, 0, 0, 0.2), 0 1px 3px rgba(255, 0, 0, 0.1);
                transform: translateY(-2px);
            }

            &:active {
                background: #ff0000;
                color: #fff;
                box-shadow: 0 2px 4px rgba(255, 0, 0, 0.2), 0 1px 2px rgba(255, 0, 0, 0.1);
                transform: translateY(1px);
            }
        }
    }
}
</style>