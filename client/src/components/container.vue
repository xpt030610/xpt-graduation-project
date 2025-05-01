<template>
    <div ref="threeContainer" class="three-container"></div>
    <div v-if="hoveredInfo.visible" class="info-box" @mouseenter="isHoveringInfoBox = true"
        @mouseleave="isHoveringInfoBox = false">
        <h3>{{ hoveredInfo.name }}</h3>
        <button @click="handleAction('edit')">编辑</button>
        <button @click="handleAction('delete')">删除</button>
    </div>
</template>

<script setup>
import * as THREE from 'three';
import { onMounted, ref } from 'vue';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';

const threeContainer = ref(null);
const buildingRefs = ref({}); // 保存模型的引用
const camera = ref(null); // 相机引用
const raycaster = new THREE.Raycaster(); // 用于检测鼠标点击的对象
const mouse = new THREE.Vector2(); // 保存鼠标位置
let controls; // 定义 OrbitControls 的引用
let hoveredObject = null; // 当前悬停的对象
let selectedObject = null; // 当前选中的对象

// 信息框状态
const hoveredInfo = ref({
    visible: false,
    x: 0,
    y: 0,
    name: '',
});

// 标记鼠标是否悬停在 info-box 上
const isHoveringInfoBox = ref(false);

// 让相机对准目标模型
const focusOnModel = (modelName) => {
    const target = buildingRefs.value[modelName];
    if (target) {
        const boundingBox = new THREE.Box3().setFromObject(target);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());
        const distance = 1
        // 使用 gsap 平滑移动相机位置
        gsap.to(camera.value.position, {
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
            y: center.y,
            z: center.z,
            duration: 1, // 动画持续时间（秒）
            ease: 'power2.out',
            onUpdate: () => {
                controls.update(); // 实时更新 OrbitControls
            },
        });

        console.log(`相机对准模型: ${modelName}`, { center, size });
    } else {
        console.error(`未找到目标对象: ${modelName}`);
    }
};

onMounted(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101010); // 设置为更纯粹的深色
    camera.value = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    threeContainer.value.appendChild(renderer.domElement);

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // 环境光，降低强度
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // 方向光
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true; // 启用阴影
    directionalLight.shadow.mapSize.width = 1024; // 阴影分辨率
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    // 加载 GLTF 模型
    const loader = new GLTFLoader();
    loader.load(
        '/src/assets/school4.glb', // 替换为你的模型路径
        (gltf) => {
            const model = gltf.scene;
            model.scale.set(1, 1, 1); // 调整模型大小
            model.position.set(0, 0, 0); // 设置模型位置
            scene.add(model);

            // 遍历模型，保存以 "building" 开头的对象
            model.traverse((child) => {
                if (child.isMesh && child.name.startsWith('building')) {
                    buildingRefs.value[child.name] = child; // 保存引用
                    child.userData.originalMaterial = child.material; // 保存原始材质
                }

            });
            focusOnModel('building')
            console.log('以 "building" 开头的模型:', buildingRefs.value);
        },
        (xhr) => {
            console.log(`模型加载进度: ${(xhr.loaded / xhr.total) * 100}%`);
        },
        (error) => {
            console.error('模型加载失败:', error);
        }
    );

    // 设置相机初始位置
    camera.value.position.set(10, 10, 10);
    camera.value.lookAt(0, 0, 0);

    // 添加 OrbitControls
    controls = new OrbitControls(camera.value, renderer.domElement);
    controls.enableDamping = true; // 启用阻尼效果（惯性）
    controls.dampingFactor = 0.05; // 阻尼系数
    controls.screenSpacePanning = false; // 禁止屏幕平移
    controls.minDistance = 1; // 设置最小缩放距离
    controls.maxDistance = 50; // 设置最大缩放距离
    controls.maxPolarAngle = Math.PI / 2; // 限制垂直旋转角度（防止翻转）

    const animate = function () {
        requestAnimationFrame(animate);

        // 渲染场景
        controls.update();
        renderer.render(scene, camera.value);
    };

    animate();

    // 窗口大小调整事件
    window.addEventListener('resize', () => {
        camera.value.aspect = window.innerWidth / window.innerHeight;
        camera.value.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 鼠标移动事件
    window.addEventListener('mousemove', (event) => {
        if (isHoveringInfoBox.value) {
            // 如果鼠标悬停在 info-box 上，不隐藏信息框
            return;
        }
        // 将鼠标位置归一化到 -1 到 1 的范围
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // 使用 Raycaster 检测悬停的对象
        raycaster.setFromCamera(mouse, camera.value);
        const intersects = raycaster.intersectObjects(Object.values(buildingRefs.value));

        if (intersects.length > 0) {
            const hovered = intersects[0].object;

            // 如果悬停的对象发生变化
            if (hoveredObject !== hovered) {
                // 恢复之前悬停对象的材质
                if (hoveredObject && hoveredObject !== selectedObject) {
                    hoveredObject.material = hoveredObject.userData.originalMaterial;
                }

                // 如果悬停对象不是选中的对象，则更改材质
                if (hovered !== selectedObject) {
                    hoveredObject = hovered;

                    hoveredObject.material = new THREE.MeshPhysicalMaterial({
                        color: 0xd3d3d3,
                        metalness: 0.1, // 金属度
                        roughness: 0.2, // 粗糙度
                        transmission: 0.4, // 透射率（玻璃效果）
                        ior: 1.5, // 折射率
                        clearcoat: 0.2, // 清漆效果
                        clearcoatRoughness: 0.1, // 清漆粗糙度
                        transparent: true, // 启用透明
                        opacity: 1, // 透明度
                        side: hovered.userData.originalMaterial.side,
                    });
                    // 更新信息框内容和位置
                    hoveredInfo.value = {
                        visible: true,
                        x: event.clientX - 20,
                        y: event.clientY - 20,
                        name: hovered.userData.name || '未知宿舍',
                    };
                }
            }

        } else {
            // 如果没有悬停对象，恢复之前悬停对象的材质
            if (hoveredObject && hoveredObject !== selectedObject) {
                hoveredObject.material = hoveredObject.userData.originalMaterial;
                hoveredObject = null;
            }
            // 隐藏信息框
            hoveredInfo.value.visible = false;
        }
    });

    // 鼠标点击事件
    window.addEventListener('click', () => {
        if (hoveredObject) {
            // 恢复之前选中对象的材质
            if (selectedObject) {
                selectedObject.material = selectedObject.userData.originalMaterial;
            }

            // 设置选中对象的材质
            selectedObject = hoveredObject;
            selectedObject.material = new THREE.MeshPhysicalMaterial({
                color: 0xd3d3d3,
                metalness: 0.3, // 金属度
                roughness: 0.2, // 粗糙度
                transmission: 0.1, // 透射率（玻璃效果）
                ior: 1.5, // 折射率
                clearcoat: 0.2, // 清漆效果
                clearcoatRoughness: 0.1, // 清漆粗糙度
                transparent: true, // 启用透明
                opacity: 1, // 透明度
                side: selectedObject.userData.originalMaterial.side,
            });

            // 调用 focusOnModel 方法
            focusOnModel(selectedObject.name);
        }
    });
});


</script>

<style scoped>
.three-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
}

.info-box {
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    font-size: 14px;
    z-index: 1000;
}

.info-box h3 {
    margin: 0 0 10px;
    font-size: 16px;
}

.info-box button {
    background: #007bff;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 5px;
    font-size: 12px;
}

.info-box button:hover {
    background: #0056b3;
}
</style>