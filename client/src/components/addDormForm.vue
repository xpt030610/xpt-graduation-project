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
                        :options="buildingOptions" />
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
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
import Axios from '../utils/axios';
import { CloseIcon } from 'tdesign-icons-vue-next';

const emit = defineEmits(['showForm']);

// 表单数据
const selectedBuilding = ref(''); // 选择的宿舍楼
const selectedFloor = ref(); // 选择的楼层
const selectedRoom = ref(''); // 选择的宿舍
const roomOptions = ref([]); // 宿舍选项

// 宿舍楼选项
// TODO: 动态获取宿舍楼数据
const buildingOptions = [
    { label: '宿舍楼A', value: 'A' },
    { label: '宿舍楼B', value: 'B' },
    { label: '宿舍楼C', value: 'C' },
];

// 楼层选项
// TODO: 动态获取楼层数据
const floorOptions = [
    { label: '一楼', value: 1 },
    { label: '二楼', value: 2 },
    { label: '三楼', value: 3 },
    { label: '四楼', value: 4 },
    { label: '五楼', value: 5 },
];

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
    roomOptions.value = data.roomDetails.map((room) => ({
        label: `${room.roomId}(${room.members.length}人)`,
        value: room.roomId,
    }));
};

// 取消逻辑
const handleCancel = () => {
    emit('showForm', 'addDorm', false); // 关闭表单
};
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
</style>