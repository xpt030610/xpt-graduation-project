<template>
    <div class="notice-form-overlay" @click.self="handleCancel">
        <div class="notice-form">
            <CloseIcon class="close-icon" @click="handleCancel" />
            <h2>发送通知</h2>

            <div class="form-content">
                <!-- 左侧：选择学生 -->
                <div class="form-left">
                    <!-- 通知成员选择 -->
                    <div class="form-group">
                        <div class="label">通知成员</div>
                        <t-select id="notifyTarget" v-model="notifyTarget" placeholder="请选择通知对象"
                            :options="notifyOptions" @change="changeType" />
                    </div>

                    <!-- 楼层选择 -->
                    <div class="form-group" v-if="notifyTarget">
                        <div class="label">选择楼层</div>
                        <t-select id="floorSelect" v-model="selectedFloor" placeholder="请选择楼层" :options="floorOptions"
                            @change="fetchRooms" />
                    </div>

                    <!-- 宿舍选择 -->
                    <div class="form-group" v-if="notifyTarget !== 'floor' && selectedFloor">
                        <div class="label">选择宿舍</div>
                        <t-select id="roomSelect" v-model="selectedRoom" placeholder="请选择宿舍" :options="roomOptions"
                            @change="fetchStudents" />
                    </div>

                    <!-- 学生选择 -->
                    <div class="form-group" v-if="notifyTarget === 'person' && selectedRoom">
                        <div class="label">选择学生</div>
                        <t-select id="studentSelect" v-model="studentList" placeholder="请选择学生"
                            :options="studentOptions" />
                    </div>

                    <!-- 学生名单 -->
                    <div class="form-group"
                        v-if="(notifyTarget === 'room' || notifyTarget === 'floor') && studentList.length">
                        <div class="label">通知成员</div>
                        <div class="student-list">
                            <t-tag v-for="(student, index) in studentList" :key="index" class="student-tag">
                                {{ student.userName }}
                            </t-tag>

                        </div>
                        <div v-if="studentList.length" class="text">
                            {{ `共 ${studentList.length} 名同学` }}
                        </div>
                    </div>
                </div>

                <!-- 右侧：填写标题和内容 -->
                <div class="form-right">
                    <!-- 通知标题 -->
                    <div class="form-group">
                        <div class="label">通知标题</div>
                        <t-input id="title" v-model="title" placeholder="请输入通知标题" />
                    </div>
                    <!-- 通知重要级 -->
                    <div class="form-group">
                        <div class="label">公告重要级</div>
                        <t-select id="noticeType" v-model="noticeType" placeholder="请选择重要级" :options="noticeTypeList" />
                    </div>
                    <!-- 通知内容 -->
                    <div class="form-group">
                        <div class="label">通知内容</div>
                        <t-textarea id="content" v-model="content" placeholder="请输入通知内容" rows="5" />
                    </div>

                    <!-- 提交按钮 -->
                    <div class="form-actions">
                        <button theme="primary" @click="handleSubmit">发送通知</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import Axios from '../utils/axios';
import { CloseIcon } from 'tdesign-icons-vue-next';
import { jwtDecode } from 'jwt-decode';

const emit = defineEmits(['close']);

// 接收传进来的 props
const props = defineProps({
    buildingId: {
        type: String,
        default: '西一', // 默认标题
    },
});

// 表单数据
const notifyTarget = ref(''); // 通知对象类型（person, floor, room）
const selectedFloor = ref(); // 选择的楼层
const title = ref(''); // 通知标题
const noticeType = ref('normal'); // 通知重要级
const content = ref(''); // 通知内容
const selectedRoom = ref(''); // 选择的宿舍
const roomList = ref([]); // 宿舍列表
const studentList = ref([]); // 学生列表

// 通知对象选项
const notifyOptions = [
    { label: '通知某人', value: 'person' },
    { label: '通知某楼层', value: 'floor' },
    { label: '通知某宿舍', value: 'room' },
];

const floorOptions = [
    { label: '一楼', value: 1 },
    { label: '二楼', value: 2 },
    { label: '三楼', value: 3 },
    { label: '四楼', value: 4 },
    { label: '五楼', value: 5 },
];

const noticeTypeList = [
    { label: '普通通知', value: 'normal' },
    { label: '紧急通知', value: 'urgent' },
    { label: '重要通知', value: 'important' },
];

const roomOptions = ref([]); // 宿舍选项
const studentOptions = ref([]); // 学生选项

// 表单提交逻辑
const handleSubmit = async () => {
    const accessToken = localStorage.getItem("access_token");
    const decoded = jwtDecode(accessToken);
    const notice = {
        buildingId: props.buildingId,
        releaseId: decoded.userId || '未知学号',
        releaseName: decoded.userName || '未知用户',
        type: noticeType.value,
        status: 'published',
        userList: studentList.value.map((student) => ({ userId: student.userId, userName: student.userName })),
        readList: [], // 初始为空
        title: title.value,
        content: content.value,
    }
    try {
        const response = await Axios.post('/dorm/notifyMembers', notice);
        const data = response.data;
        MessagePlugin.success('通知发送成功！');
        console.log('通知发送结果:', notice, data);

        // 重置表单
        resetForm();
    } catch (error) {
        console.error('通知发送失败:', error);
        // 弹出错误提示
        MessagePlugin.error('通知发送失败，请稍后重试！');
    }
};

const changeType = () => {
    selectedRoom.value = ''; // 重置宿舍选择
    selectedFloor.value = ''; // 重置楼层选择
    studentList.value = []; // 重置学生选择
    roomOptions.value = []; // 重置宿舍选项
    studentOptions.value = []; // 重置学生选项
}

const fetchRooms = async () => {
    selectedRoom.value = ''; // 重置宿舍选择
    studentList.value = []; // 重置学生选择
    console.log('buidingId:', props.buildingId, selectedFloor.value);
    const response = await Axios.post('/dorm/getRoomsByFloor', {
        buildingId: props.buildingId,
        floor: selectedFloor.value,
    });
    const data = response.data;
    console.log('获取宿舍:', data, response);
    // 只显示有人的宿舍
    roomList.value = data.roomDetails.filter((room) => room.members.length > 0);
    roomOptions.value = roomList.value.map((room) => ({
        label: `${room.roomId}(${room.members.length}人)`,
        value: room.roomId,
    }));
    // 根据选择的楼层获取宿舍列表,全部选取
    if (notifyTarget.value === 'floor') {
        studentList.value = roomList.value.reduce((acc, room) => {
            return acc.concat(room.members.map((student) => ({
                userName: student.userName,
                userId: student.userId,
            })));
        }, []);
    }

}

const fetchStudents = () => {
    const selectedRoomData = roomList.value.find((room) => room.roomId === selectedRoom.value);
    if (selectedRoomData) {
        studentList.value = selectedRoomData.members.map((student) => ({
            userName: student.userName,
            userId: student.userId,
        }));
        studentOptions.value = studentList.value.map((student) => ({
            label: student.userName,
            value: student.userId,
        }));
    } else {
        studentList.value = [];
    }
    console.log('获取学生:', studentList.value);
}

// 重置表单
const resetForm = () => {
    notifyTarget.value = '';
    title.value = '';
    content.value = '';
};

// 取消逻辑
const handleCancel = () => {
    emit('close');
    resetForm();
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
        top: 20px;
        right: 20px;
        cursor: pointer;
        font-size: 24px;
        color: #ddd;
    }

    h2 {
        margin-bottom: 20px;
        text-align: center;
    }
}

.form-content {
    display: flex;
    gap: 20px;
}

.form-left,
.form-right {
    flex: 1;
}

.form-group {
    margin-bottom: 20px;

    .label {
        font-size: 14px;
        font-weight: 700;
        color: #ddd;
        margin-bottom: 5px;
    }

    .student-list {
        display: flex;
        align-items: center;

        .student-tag {
            margin-right: 5px;
        }
    }

    .text {
        display: flex;
        color: #ddd;
        font-size: 12px;
        font-weight: 400;
        margin-top: 5px;
    }
}

.form-actions {
    display: flex;
    justify-content: space-between;

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