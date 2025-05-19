<template>
    <transition name="fade">
        <div class="repair-table-container">
            <div class="table-header">
                <h2>所有维修单</h2>
                <CloseIcon class="close-button" @click="closeTable" />
            </div>
            <table class="repair-table">
                <thead>
                    <tr>
                        <th>房间</th>
                        <th>内容</th>
                        <th>保修人</th>
                        <th>设备</th>
                        <th>时间</th>
                        <th>进度</th>
                        <th v-if="isAdmin">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="repair in repairList" :key="repair.noticeId">
                        <td>{{ repair.roomId }}</td>
                        <td class="content-cell">{{ repair.description }}</td>
                        <td>{{ repair.reporterName }}</td>
                        <td>{{ repair.deviceName }}</td>
                        <td>{{ formatTime(repair.createdTime) }}</td>
                        <td :class="repair.status">
                            {{ getStatusLabel(repair.status) }}
                        </td>
                        <td v-if="isAdmin">
                            <button class="detail-button" @click="changeStatus()">流转状态</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </transition>
</template>

<script setup>
import { defineEmits, ref, computed } from 'vue';
import { CloseIcon } from 'tdesign-icons-vue-next';
import Axios from '../utils/axios';
import { useStore } from '../stores';
const Store = useStore();
const isAdmin = computed(() => Store.isAdmin);
const repairList = computed(() => Store.repairList);

const emit = defineEmits(['close']);

const closeTable = () => {
    emit('showForm', 'repair', false);
};

const formatTime = (time) => {
    const date = new Date(time);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const getStatusLabel = (type) => {
    switch (type) {
        case 'pending':
            return '待处理';
        case 'progress':
            return '处理中';
        case 'completed':
            return '已完成';
        case 'cancelled':
            return '已拒绝';
        default:
            return '未知状态';
    }
};

const changeStatus = () => {
    // TODO: Implement status change logic
    console.log('Status change logic');
};
</script>

<style scoped lang="less">
.repair-table-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    width: 80%;
    max-height: 80%;
    overflow-y: auto;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);

    .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
            margin: 0;
            font-size: 18px;
        }

        .close-button {
            position: absolute;
            top: 20px;
            right: 20px;
            cursor: pointer;
            font-size: 24px;
            color: #ddd;
        }
    }

    .repair-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;

        th,
        td {
            padding: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            text-align: center;
        }

        th {
            background: rgba(255, 255, 255, 0.1);
            font-weight: bold;
        }

        .content-cell {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 200px;
        }

        td.urgent {
            color: #ff4d4f;
        }

        td.important {
            color: #faad14;
        }

        td.normal {
            color: #fff;
        }
    }

    .detail-button,
    .edit-button {
        background: #1890ff;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;

        &:hover {
            background: #40a9ff;
        }
    }

    .edit-button {
        background: #52c41a;
        margin-left: 10px;

        &:hover {
            background: #73d13d;
        }
    }
}

.repair-detail-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.95);
    color: black;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    z-index: 1100;
    width: 75%;
    overflow-y: auto;
    padding: 20px;

    .modal-content {
        margin-top: 25px;

        h3 {
            margin-top: 0;
        }

        p {
            margin: 10px 0;
        }

        .edit-title {
            display: flex;
            align-items: center;
            margin-bottom: 10px;

            strong {
                flex-shrink: 0;
                margin-right: 10px;
            }
        }

        .close-button {
            position: absolute;
            top: 20px;
            right: 20px;
            cursor: pointer;
            font-size: 24px;
            color: #333;
        }
    }

    .edit-button {
        margin-left: 0;
        margin-top: 20px;
    }
}
</style>