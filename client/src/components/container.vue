<template>
    <div class="wrapper">
        <div ref="threeContainer" class="three-container"></div>
        <div v-if="hoveredInfo.visible" class="info-box"
            :style="{ top: hoveredInfo.y + 'px', left: hoveredInfo.x + 'px' }">
            <h3>{{ hoveredInfo.name }}</h3>
        </div>
        <div v-if="dormInfo.visible" class="dorm-box" :style="{ top: dormInfo.y + 'px', left: dormInfo.x + 'px' }">
            <h3>{{ dormInfo.name }}</h3>
            <div class="floor-buttons">
                <button class="btn" v-for="(floor, index) in dormInfo.floors" :key="floor" :class="{
                    active: dormInfo.selectedFloor === floor,
                    error: isShowError && errorFloor.includes(index + 1)
                }" @click="selectFloor(floor)">
                    {{ floor }} 楼
                </button>
                <button v-if="isAdmin" class="btn primary" @click="handleAction('notice')">发送通知</button>
            </div>
        </div>
        <floorPlan v-if="isShowFloorPlan" :floorInfo="dormInfo" :buildingId="selectedObject.name.split('-')[1]"
            @close="isShowFloorPlan = false" />
        <NoticeForm v-if="isShowNoticeForm" :buildingId="hoveredInfo.name || '西一'" @close="isShowNoticeForm = false" />
        <div class="btns">
            <button class="btn" @click="focusOnTopView">宿舍楼俯视图</button>
            <button class="btn" @click="showError" :class="{ 'btn-warning-active': isShowError }">
                宿舍楼状态
            </button>
        </div>
    </div>
</template>

<script setup>
import * as THREE from 'three';
import { onUnmounted, onMounted, ref, computed } from 'vue';
import NoticeForm from './noticeForm.vue';
import floorPlan from './floorPlan.vue';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import throttle from 'lodash/throttle';
import Axios from '../utils/axios';
import { useStore } from '../stores';
const Store = useStore();

// 管理员
const isAdmin = computed(() => Store.isAdmin);

// 缓存悬停材质
const hoverMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd3d3d3,
    metalness: 0.1,
    roughness: 0.2,
    transmission: 0.4,
    ior: 1.5,
    clearcoat: 0.2,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 1,
});

// 缓存选中材质
const selectedMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd3d3d3,
    metalness: 0.3, // 金属度
    roughness: 0.2, // 粗糙度
    transmission: 0.1, // 透射率（玻璃效果）
    ior: 1.5, // 折射率
    clearcoat: 0.2, // 清漆效果
    clearcoatRoughness: 0.1, // 清漆粗糙度
    transparent: true, // 启用透明
    opacity: 1, // 透明度
});

const threeContainer = ref(null);
const raycaster = new THREE.Raycaster(); // 用于检测鼠标点击的对象
const mouse = new THREE.Vector2(); // 保存鼠标位置
let camera; // 相机引用
let controls;

const buildingRefs = ref({}); // 保存模型的引用
let hoveredObject = null; // 当前悬停的对象
let selectedObject = null; // 当前选中的对象

// 信息框状态
const hoveredInfo = ref({
    visible: false,
    x: 0,
    y: 0,
    name: '',
});

// 宿舍框
const dormInfo = ref({
    visible: false,
    x: 0,
    y: 0,
    name: '',
    floors: 5, // 默认五层楼
    selectedFloor: 1, // 默认显示五楼
});

let targetObject = null; // 当前选中的对象
const isShowNoticeForm = ref(false); // 是否显示通知表单
const isShowFloorPlan = ref(false); // 是否显示楼层平面图

// 操作按钮点击事件
const handleAction = (action) => {
    switch (action) {
        case 'notice':
            isShowNoticeForm.value = true;
            hoveredInfo.value.visible = false; // 隐藏信息框
            break;

        default:
            break;
    }
    console.log(`执行操作: ${action}`);
};

// 获取宿舍楼数据
const buildingOptions = ref([])
const fetchBuildings = async () => {
    const response = await Axios.get('/dorm/getAllBuildings');
    const data = response.data;
    console.log('获取宿舍楼:', data, response);
    buildingOptions.value = data.map((building) => ({
        name: building.name,
        floors: building.floors,
    }));
};

// 获取问题宿舍数据
const errorBuildings = ref([])
const fetchErrorBuildings = async () => {
    const response = await Axios.get('/dorm/checkRoomIndicators');
    const data = response.data;
    console.log('获取问题宿舍:', data, response);
    errorBuildings.value = [];
    for (const dorm of data) {
        const buildingId = dorm.buildingId;
        const roomId = dorm.roomId;
        const roomPart = roomId.substring(buildingId.length); // 例如 "424" 从 "西四424"
        console.log(`解析出的楼栋号: ${roomPart}`);
        const floor = roomPart[0]; // 提取到的楼层号，例如 "4"
        console.log(`解析出的楼层号: ${floor}`);
        if (!errorBuildings.value[buildingId]) {
            errorBuildings.value[buildingId] = {};
        }
        if (!errorBuildings.value[buildingId][floor]) {
            errorBuildings.value[buildingId][floor] = [];
        }
        errorBuildings.value[buildingId][floor].push({
            ...dorm,
        });
    }
    console.log('errorBuildings.value', errorBuildings.value);
};

const isShowError = ref(false)
const showError = () => {
    isShowError.value = !isShowError.value;
    for (const building in errorBuildings.value) {
        console.log('building1', building);
        const model = buildingRefs.value['building-' + building]
        if (model) {
            console.log('model', model);
            model.material = model.material.clone();
            model.material.emissive = new THREE.Color(0x000000);
            if (isShowError.value) {
                gsap.to(model.material.emissive, {
                    // 使用暖橙色
                    r: 1, g: 0.5, b: 0, // 调整 RGB 分量为暖橙色
                    duration: 4,
                    repeat: -1, // Repeat indefinitely
                    yoyo: true, // Go back and forth
                    ease: "power1.inOut"
                });
                gsap.to(model.material, {
                    emissiveIntensity: 0.8, // 脉冲强度
                    duration: 4,
                    repeat: -1, // Repeat indefinitely
                    yoyo: true, // Go back and forth
                    ease: "power1.inOut"
                });
            } else {
                gsap.killTweensOf(model.material.emissive);
                gsap.killTweensOf(model.material);
                // 恢复原始材质
                model.material = model.userData.originalMaterial;
            }
        }
    }
    console.log("building", buildingRefs.value, errorBuildings.value)
}

// 选择楼层
const selectFloor = (floor) => {
    dormInfo.value.selectedFloor = floor;
    isShowFloorPlan.value = true; // 显示宿舍信息框
    console.log(`选择了第 ${floor} 楼`);
    // 可以在这里添加逻辑，比如根据楼层加载不同的数据
};

const errorFloor = ref([])
// 让相机对准目标模型
const focusOnModel = (model) => {
    // 恢复之前选中对象的材质
    if (selectedObject && !isShowError.value) {
        selectedObject.material = selectedObject.userData.originalMaterial;
    }
    // 设置选中对象的材质
    selectedObject = model;
    const modelName = model.name
    if (!isShowError.value) {
        model.material = selectedMaterial
    }

    const target = buildingRefs.value[modelName];
    if (target) {
        targetObject = target;

        const boundingBox = new THREE.Box3().setFromObject(target);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());
        const distance = 5
        controls.enableDamping = false;

        // 使用 gsap 平滑移动相机位置
        gsap.to(camera.position, {
            x: center.x + distance,
            y: center.y + distance,
            z: center.z + distance,
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
            y: 0,
            z: center.z,
            duration: 1, // 动画持续时间（秒）
            ease: 'power2.out',
            onUpdate: () => {
                controls.update();
            },
        });
        console.log("buildingOptions.value", buildingOptions.value, modelName)
        // 显示信息框
        dormInfo.value.visible = true;
        dormInfo.value.floors =
            buildingOptions.value.find(item => item.name === modelName.split("-")[1]).floors
        // 如果有error楼层则显示
        const name = modelName.split("-")[1]
        errorFloor.value = []
        if (errorBuildings.value[name]) {
            const floorsWithErrors = errorBuildings.value[name];
            for (const floor in floorsWithErrors) {
                // 确保键是数字或可以转换为数字的字符串
                if (!isNaN(Number(floor))) {
                    errorFloor.value.push(Number(floor)); // 将楼层号转换为数字并添加到数组
                } else {
                    console.warn(`发现非数字楼层键: ${floor}`);
                }
            }
            console.log('errorBuildings.value[name]', errorBuildings.value[name], errorFloor.value)
        }
        console.log('errorBuildings.value', errorBuildings.value, name, errorBuildings.value[name]);

        console.log(`相机对准模型: ${modelName}`, { center, size });
    } else {
        console.error(`未找到目标对象: ${modelName}`);
    }
};

// 让视角变成俯视图
const focusOnTopView = () => {
    const target = new THREE.Vector3(0, 0, -5); // 目标点
    const distance = 25; // 相机与目标点的距离
    dormInfo.value.visible = false;
    gsap.to(camera.position, {
        x: target.x,
        y: target.y + distance,
        z: target.z,
        duration: 1, // 动画持续时间（秒）
        ease: 'power2.out', // 缓动效果
        onUpdate: () => {
            controls.update();
        },
    });
    gsap.to(controls.target, {
        x: target.x,
        y: target.y,
        z: target.z - 1,
        duration: 1, // 动画持续时间（秒）
        ease: 'power2.out',
        onUpdate: () => {
            controls.update();
        },
    });
};

// 自动切割建筑物
const autoSplitBuildings = (model, segments = 5) => {
    console.log('model', model, segments);
    // 1. 收集需要处理的建筑对象
    const buildingsToProcess = [];
    model.traverse(obj => {
        if (obj.isMesh && obj.name.startsWith('building')) {
            buildingsToProcess.push(obj);
        }
    });

    // 2. 处理每个建筑对象
    buildingsToProcess.forEach(obj => {
        obj.userData.originalMaterial = obj.material; // 保存原始材质
        buildingRefs.value[obj.name] = obj;
    });
    console.log('model', model);

    return model;
}

// 优化后的鼠标移动事件
const onMouseMove = throttle((event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(Object.values(buildingRefs.value)); // 只检测建筑物对象
    // 有效hover
    if (intersects.length > 0) {
        const hovered = intersects[0].object;
        let name = hovered.userData.name
        if (name) {
            name = name.split("-")[1] || '未知宿舍'
        }
        console.log('hovered', hovered.userData.name, name);
        hoveredInfo.value = {
            x: event.clientX + 10,
            y: event.clientY + 10,
            name
        };
        // 出提示
        if (!hoveredInfo.value.visible) {
            hoveredInfo.value.visible = true;
        }
        // 指针变成手型
        threeContainer.value.style.cursor = 'pointer';
        // 如果切换了悬停对象，重置之前的 hoveredObject 的材质
        if (hoveredObject !== hovered && !isShowError.value) {
            // 恢复之前选中对象的材质为默认
            if (hoveredObject && hoveredObject !== selectedObject) {
                hoveredObject.material = hoveredObject.userData.originalMaterial;
            }
            // 设置新选中的对象的材质
            hoveredObject = hovered;
            // 如果这个是点击中的，则不变色
            if (hoveredObject && selectedObject && hoveredObject === selectedObject) {
                hoveredObject.material = selectedMaterial;
                return;
            }
            if (hoveredObject.userData) {
                hoveredObject.material = hoverMaterial;
            }
        } else if (isShowError.value) {
            hoveredObject = hovered;
        }
    }
    else {
        // 如果没有悬停对象，重置 hoveredObject
        if (hoveredObject && selectedObject && hoveredObject !== selectedObject) {
            hoveredObject.material = hoveredObject.userData.originalMaterial;
            hoveredObject = null;
        }
        // 隐藏信息框
        if (hoveredInfo.value.visible) {
            hoveredInfo.value.visible = false;
        }
        // 恢复鼠标指针样式
        threeContainer.value.style.cursor = 'auto';
    }
}, 200);

const onClick = () => {
    console.log('点击事件触发', hoveredObject);
    if (hoveredObject) {
        focusOnModel(hoveredObject);
    }
}

onMounted(() => {
    // 获取宿舍楼数据
    fetchBuildings();
    fetchErrorBuildings();
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
    loader.load('/src/assets/school.glb', (gltf) => {
        // 自动切割所有建筑
        const model = autoSplitBuildings(gltf.scene);
        // const model = gltf.scene;
        console.log('模型:', model);
        model.scale.set(1, 1, 1); // 调整模型大小
        model.position.set(0, 0, 0); // 设置模型位置
        scene.add(model);
        console.log('模型加载完成:', scene);
        focusOnModel(buildingRefs.value['building-西一']); // 默认对准第一个建筑物
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

    // 禁用交互
    // controls.enabled = false;

    // 动画循环
    const animate = () => {
        requestAnimationFrame(animate);

        // 实时更新信息框位置
        if (targetObject && dormInfo.value.visible) {
            const boundingBox = new THREE.Box3().setFromObject(targetObject);
            const center = boundingBox.getCenter(new THREE.Vector3());
            const size = boundingBox.getSize(new THREE.Vector3()); // 获取建筑物的尺寸

            // 将 3D 坐标转换为屏幕坐标
            const vector = center.clone().project(camera);
            const screenX = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const screenY = (-vector.y * 0.5 + 0.5) * window.innerHeight;

            const offsetX = 300;
            const offsetY = 0;

            // 更新信息框位置
            dormInfo.value.x = screenX + offsetX;
            dormInfo.value.y = screenY + offsetY;
        }

        controls.update();
        renderer.render(scene, camera);
    };
    animate();

    const container = threeContainer.value;
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);

    // 窗口大小调整事件
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

});

// 在组件销毁时移除事件监听器
onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('click', onClick);
});
</script>

<style scoped lang="less">
.wrapper {
    overflow: hidden;
    position: relative;
}

.three-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
}

.info-box,
.dorm-box {
    flex-direction: column;
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    font-size: 14px;
    z-index: 9;

    h3 {
        font-size: 16px;
    }

    .btn {
        position: relative;
        top: 0;
        left: 0;
        padding: 6px 12px;
        min-width: 112px;
    }

    .floor-buttons {
        display: flex;
        flex-direction: column;
        gap: 5px;

        .btn {
            font-size: 16px;
            padding: 6px 24px;

            &.primary {
                background: #007bff;
                color: #fff;
                border: none;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1);
            }
        }
    }
}

.dorm-box {
    display: flex;
    background: transparent;
    box-shadow: none;
}

.btns {
    position: absolute;
    top: 80px;
    left: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.btn {
    background: #ffffff;
    font-weight: 700;
    color: #333;
    border: 0;
    padding: 12px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 9;

    &:hover {
        background: #f0f0f0;
        color: #000;
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
    }

    &.active {
        color: #007bff;
        border: 1px solid #007bff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1);
        transform: translateY(1px);
    }

    &.error {
        background-color: #ffc107;
        color: #343a40;
    }
}

.btn-warning-active {
    /* 浅黄色背景 */
    background-color: #fffacd;
    /* 例如：LemonChiffon */
    border-color: #ffc107;
    /* 可以保留边框颜色或根据需要修改 */
    color: #343a40;
    /* 深色文本 */
    box-shadow: 0 0 10px #ffc107;
    /* 黄色光晕效果 */
    transition: all 0.3s ease;
    /* 添加过渡效果 */

    /* 新增：hover 状态样式 */
    &:hover {
        background-color: #ffe4b5;
        /* 鼠标悬停时颜色稍微变深 */
        box-shadow: 0 0 15px #ffc107;
        /* 悬停时光晕效果增强 */
        transform: translateY(-1px);
        /* 轻微上移效果 */
    }
}
</style>