<template>
    <div class="notice-form-overlay" @click.self="handleCancel">
        <div class="notice-form">
            <CloseIcon class="close-icon" @click="handleCancel" />
            <h2>选择宿舍</h2>

            <div class="form-content">
                <!-- 宿舍楼选择 -->
                <div class="form-group">
                    <div class="label">选择宿舍楼</div>
                    <t-select id="buildingSelect" v-model="selectedBuilding" placeholder="请选择宿舍楼"
                        :options="buildingOptions" @change="changeBuilding" />
                </div>

                <!-- 宿舍层选择 -->
                <div class="form-group" v-if="selectedBuilding">
                    <div class="label">选择楼层</div>
                    <t-select id="floorSelect" v-model="selectedFloor" placeholder="请选择楼层" :options="floorOptions"
                        @change="fetchRooms" />
                </div>

                <!-- 宿舍选择 -->
                <div class="form-group" v-if="selectedFloor">
                    <div class="label">选择宿舍</div>
                    <t-select id="roomSelect" v-model="selectedRoom" placeholder="请选择宿舍" :options="roomOptions" />
                </div>

                <div class="form-actions">
                    <button theme="primary" @click="handleSubmit">申请加入</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineEmits, onMounted, computed } from 'vue';
import Axios from '../utils/axios';
import { CloseIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import router from '../router';
import { useStore } from '../stores';
const Store = useStore();

const userInfo = computed(() => Store.userInfo);

const emit = defineEmits(['showForm']);

// 表单数据
const selectedBuilding = ref(''); // 选择的宿舍楼
const selectedFloor = ref(''); // 选择的楼层
const selectedRoom = ref(''); // 选择的宿舍

const buildingOptions = ref([])
const floorOptions = ref([])
const roomOptions = ref([]);

// 获取宿舍楼数据
const fetchBuildings = async () => {
    const response = await Axios.get('/dorm/getAllBuildings');
    const data = response.data;
    console.log('获取宿舍楼:', data, response);
    buildingOptions.value = data.map((building, index) => ({
        label: building.name,
        value: building.name,
        floors: building.floors,
    }));
};

// 选择宿舍楼
const changeBuilding = () => {
    selectedFloor.value = ''; // 重置楼层选择
    selectedRoom.value = ''; // 重置宿舍选择
    console.log('selectedBuilding:', selectedBuilding.value);
    const building = buildingOptions.value.find((b) => b.value === selectedBuilding.value);
    if (building) {
        floorOptions.value.length = 0; // 清空楼层选项
        for (let i = 1; i <= building.floors; i++) {
            floorOptions.value.push({ label: `${i}楼`, value: i });
        }
    }
};

// 获取宿舍列表
const fetchRooms = async () => {
    selectedRoom.value = ''; // 重置宿舍选择
    console.log('buildingId:', selectedBuilding.value, selectedFloor.value);
    const response = await Axios.post('/dorm/getRoomsByFloor', {
        buildingId: selectedBuilding.value,
        floor: selectedFloor.value,
    });
    const data = response.data;
    console.log('获取宿舍:', data, response);
    // 显示剩余床位的人数
    roomOptions.value = data.roomDetails.map((room) => ({
        label: `${room.roomId} (剩${5 - room.members.length}位)`,
        value: room.roomId,
    }));
};

// 取消逻辑
const handleCancel = () => {
    emit('showForm', 'addDorm', false); // 关闭表单
};

const handleSubmit = async () => {
    if (!selectedRoom.value) {
        MessagePlugin.error('请选择宿舍');
        return;
    }
    console.log('申请加入宿舍:', selectedRoom.value);
    try {
        const response = await Axios.post('/dorm/join', {
            roomId: selectedRoom.value,
            userId: userInfo.userId,
        });
        const data = response.data;
        console.log('申请加入宿舍:', data, response);
        MessagePlugin.success(`成功进入${selectedRoom.value}宿舍，请重新登录`);
        localStorage.removeItem("access_token"); // 清除 JWT
        emit('showForm', 'addDorm', false); // 关闭表单
        router.push('/login'); // 跳转到登录页面
    } catch (error) {
        console.error('申请加入宿舍失败:', error);
        MessagePlugin.error('申请加入宿舍失败，请稍后重试！');
        return;
    }
};

onMounted(() => {
    // 获得宿舍楼数据
    fetchBuildings();
})
</script>

<style scoped lang="less">
.notice-form-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.notice-form {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    max-width: 800px;
    width: 90%;
    padding: 30px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.9));
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(20px);
    color: white;

    .close-icon {
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
        font-size: 20px;
        color: #333;
    }

    h2 {
        margin-bottom: 20px;
        text-align: center;
    }
}

.form-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    .label {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 8px;
        display: block;
    }
}

.form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;

    button {
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
}
</style>