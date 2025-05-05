<template>
    <div class="notice-form-overlay">
        <div class="notice-form">
            <h2>发送通知</h2>

            <!-- 通知成员选择 -->
            <div class="form-group">
                <div class="label">通知成员</div>
                <t-select id="notifyTarget" v-model="notifyTarget" placeholder="请选择通知对象" :options="notifyOptions" />
            </div>

            <!-- 楼层选择（仅当选择宿舍时显示） -->
            <div class="form-group" v-if="notifyTarget === 'room'">
                <div class="label">选择楼层</div>
                <t-select id="floorSelect" v-model="selectedFloor" placeholder="请选择楼层" :options="floorOptions"
                    @change="fetchRooms" />
            </div>

            <!-- 宿舍选择（仅当选择宿舍时显示） -->
            <div class="form-group" v-if="notifyTarget === 'room' && selectedFloor">
                <div class="label">选择宿舍</div>
                <t-select id="roomSelect" v-model="selectedRoom" placeholder="请选择宿舍" :options="roomOptions"
                    @change="fetchStudents" />
            </div>

            <!-- 学生名单-->
            <div class="form-group" v-if="notifyTarget === 'room' && selectedRoom">
                <div class="label">宿舍成员</div>
                <div class="student-list">
                    {{ studentList.join('、') }} 等 {{ studentList.length }} 名同学
                </div>
            </div>

            <!-- 通知标题 -->
            <div class="form-group">
                <div class="label">通知标题</div>
                <t-input id="title" v-model="title" placeholder="请输入通知标题" />
            </div>

            <!-- 通知内容 -->
            <div class="form-group">
                <div class="label">通知内容</div>
                <t-textarea id="content" v-model="content" placeholder="请输入通知内容" rows="5" />
            </div>

            <!-- 提交按钮 -->
            <div class="form-actions">
                <t-button theme="primary" @click="handleSubmit">发送通知</t-button>
                <t-button theme="default" @click="handleCancel">取消</t-button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';

// 表单数据
const notifyTarget = ref(''); // 通知对象类型（person, floor, room）
const targetDetail = ref(''); // 具体目标（姓名、楼层号、宿舍号）
const title = ref(''); // 通知标题
const content = ref(''); // 通知内容

// 通知对象选项
const notifyOptions = [
    { label: '通知某人', value: 'person' },
    { label: '通知某楼层', value: 'floor' },
    { label: '通知某宿舍', value: 'room' },
];

// 表单提交逻辑
const handleSubmit = () => {
    console.log('通知发送:', {
        notifyTarget: notifyTarget.value,
        targetDetail: targetDetail.value,
        title: title.value,
        content: content.value,
    });
    alert('通知已发送！');
    resetForm();
};

// 取消逻辑
const handleCancel = () => {
    resetForm();
};

// 重置表单
const resetForm = () => {
    notifyTarget.value = '';
    targetDetail.value = '';
    title.value = '';
    content.value = '';
};


const fetchRooms = () => {

}
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
}

.notice-form h2 {
    margin-bottom: 20px;
    text-align: center;
}

.form-group {
    margin-bottom: 20px;

    .label {
        font-size: 14px;
        font-weight: 700;
        color: #ddd;
        margin-bottom: 5px;
    }

}

.form-group .form-actions {
    display: flex;
    justify-content: space-between;
}
</style>