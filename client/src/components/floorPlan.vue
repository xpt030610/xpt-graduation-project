<template>
    <div v-if="floorInfo.visible" class="overlay" @click="closeFloorPlan">
        <div class="floor-plan" @click.stop>
            <div class="floor-name">{{ props.floorInfo.selectedFloor }}F</div>
            <div class="stair left-stair">楼梯</div>
            <div class="stair right-stair">楼梯</div>
            <div class="hallway"></div>
            <div class="top">
                <div class="room" v-for="room in roomList.slice(0, Math.ceil(roomList.length / 2))" :key="room.roomId"
                    @click="openRoom(room)">
                    {{ room.roomId }}
                </div>
            </div>
            <div class="bottom">
                <div class="room" v-for="room in roomList.slice(Math.ceil(roomList.length / 2))" :key="room.roomId"
                    @click="openRoom(room)">
                    {{ room.roomId }}
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { defineEmits, defineProps, ref, onMounted } from 'vue';
import Axios from '../utils/axios';
import { useStore } from '../stores';
const Store = useStore();

const emit = defineEmits(['close']);
const props = defineProps({
    floorInfo: {
        type: Object,
    },
    buildingId: {
        type: String,
        default: '',
    },
});
const closeFloorPlan = () => {
    emit('close');
};
const roomList = ref([]); // 选择的宿舍
// 获取宿舍列表
const fetchRooms = async () => {
    roomList.value = []; // 重置宿舍选择
    console.log('floorInfo:', props.floorInfo, props.buildingId);
    const response = await Axios.post('/dorm/getRoomsByFloor', {
        buildingId: props.buildingId,
        floor: props.floorInfo.selectedFloor,
    });
    const data = response.data;
    console.log('获取宿舍:', data, response);
    roomList.value = data.roomDetails
};

const openRoom = (room) => {
    Store.setRoomInfo(room)
}

onMounted(() => {
    fetchRooms();
});
</script>
<style scoped lang="less">
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5); // 半透明黑色遮罩
    z-index: 10; // 确保遮罩层在最上方
    display: flex;
    justify-content: center;
    align-items: center;

    .floor-plan {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%); // 居中显示
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 1000px; // 楼层图宽度
        height: 400px; // 楼层图高度
        background: #f9f9f9; // 楼层背景色
        border: 2px solid #000; // 楼层边框
        border-radius: 8px; // 圆角
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); // 阴影效果
        padding: 10px 100px;
        z-index: 10;

        .floor-name {
            position: absolute;
            top: 10px;
            left: 10px;
            font-size: 24px;
            font-weight: 700;
        }

        .hallway {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%); // 居中显示
            width: calc(100% - 200px);
            height: 50px; // 走廊宽度
            background: #e0e0e0; // 走廊背景色
            border: 2px dashed #000; // 虚线边框
            z-index: 1;
        }

        .top,
        .bottom {
            position: absolute;
            display: flex;
            gap: 10px;
            width: calc(100% - 200px); // 房间宽度
            justify-content: space-between;
        }

        .top {
            top: 10px; // 靠左侧
        }

        .bottom {
            bottom: 10px; // 靠右侧
        }

        .room {
            width: 80px; // 房间宽度
            height: 120px; // 房间高度
            background: #fff; // 房间背景色
            border: 2px solid #000; // 房间黑框
            display: flex;
            justify-content: center; // 房间号居中
            align-items: center;
            font-size: 14px;
            font-weight: bold;
            border-radius: 4px; // 房间圆角
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); // 房间阴影
            writing-mode: vertical-rl; // 文字竖向排列
            text-orientation: upright; // 文字直立显示

            &:hover {
                background: #f0f0f0; // 悬停时背景色
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); // 悬停时阴影
                cursor: pointer;
            }
        }

        .stair {
            position: absolute;
            width: 50px; // 楼梯宽度
            height: 200px; // 楼梯高度
            background: #dcdcdc; // 楼梯背景色
            border: 2px solid #000; // 楼梯边框
            display: flex;
            justify-content: center; // 楼梯文字居中
            align-items: center;
            font-size: 16px;
            font-weight: bold;
            border-radius: 4px; // 楼梯圆角
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); // 楼梯阴影
        }

        .left-stair {
            top: 50%;
            left: 10px; // 靠左侧，距离楼层图 120px
            transform: translateY(-50%);
        }

        .right-stair {
            top: 50%;
            right: 10px; // 靠右侧，距离楼层图 120px
            transform: translateY(-50%);
        }
    }
}
</style>