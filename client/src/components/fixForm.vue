<template>
    <div class="fix-form-overlay" @click.self="handleCancel">
        <div class="fix-form">
            <CloseIcon class="close-icon" @click="handleCancel" />
            <h2>设备保修</h2>

            <div class="form-content">
                <div class="form-group">
                    <div class="label">宿舍</div>
                    <div>{{ roomId }}</div>
                </div>
                <div class="form-group">
                    <div class="label">保修设备</div>
                    <div>{{ typeName(prop.type) }}</div>
                </div>
                <div class="form-group">
                    <div class="label">保修用户</div>
                    <div>{{ userName }}</div>
                </div>
                <div class="form-group">
                    <div class="label">维修描述</div>
                    <t-input v-model="description" />
                </div>
                <div class="form-actions">
                    <button theme="primary" @click="handleSubmit">保修设备</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { CloseIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';

import { ref, defineEmits, defineProps, computed } from 'vue';
import { useStore } from '../stores';
import Axios from '../utils/axios';
const Store = useStore();

const roomId = computed(() => Store.roomInfo.roomId)
const userName = computed(() => Store.userInfo.userName)
const userId = computed(() => Store.userInfo.userId)

const emit = defineEmits(['close']);
const prop = defineProps({
    type: {
        type: String,
        default: 'door'
    },
})

const description = ref('')

const typeName = (type) => {
    switch (type) {
        case 'door':
            return '大门'
        case 'window':
            return '窗户'
        case 'air':
            return '空调'
        case 'table':
            return '椅子'
        case 'water':
            return '饮水机'
        default:
            return ''
    }
}

const handleCancel = () => {
    emit('close')
}

const handleSubmit = async () => {
    const params = {
        roomId: roomId.value,
        device: prop.type,
        userId: userId.value,
        userName: userName.value,
        deviceName: typeName(prop.type),
        description: description.value,
    }
    const response = await Axios.post('/repair/createRepairOrder', params);
    const data = response.data;
    console.log('设备保修:', data, response);
    MessagePlugin.success('设备保修成功')
    emit('close')
}
</script>

<style scoped lang="less">
.fix-form-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    z-index: 999;
}

.fix-form {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    margin-right: 20px;
    max-width: 800px;
    width: 30%;
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
        font-size: 20px;
        color: #ddd;
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