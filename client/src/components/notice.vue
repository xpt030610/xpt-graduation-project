<template>
    <transition name="fade">
        <div class="notification-table-container">
            <div class="table-header">
                <h2>所有通知</h2>
                <CloseIcon class="close-button" @click="closeTable" />
            </div>
            <table class="notification-table">
                <thead>
                    <tr>
                        <th>标题</th>
                        <th>内容</th>
                        <th>发布人</th>
                        <th>宿舍楼</th>
                        <th>时间</th>
                        <th>类型</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="notice in noticeList" :key="notice.noticeId">
                        <td>{{ notice.title }}</td>
                        <td class="content-cell">{{ notice.content }}</td>
                        <td>{{ notice.releaseName }}</td>
                        <td>{{ notice.buildingId }}</td>
                        <td>{{ formatTime(notice.createdTime) }}</td>
                        <td :class="notice.type">
                            {{ getTypeLabel(notice.type) }}
                        </td>
                        <td>
                            <button class="detail-button" @click="viewDetails(notice)">查看详情</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <!-- 详细通知弹窗 -->
            <div v-if="selectedNotice" class="notice-detail-modal">
                <div class="modal-content">
                    <h3>{{ selectedNotice.title }}</h3>
                    <p><strong>发布人:</strong> {{ selectedNotice.releaseName }}</p>
                    <p><strong>宿舍楼:</strong> {{ selectedNotice.buildingId }}</p>
                    <p><strong>时间:</strong> {{ formatTime(selectedNotice.createdTime) }}</p>
                    <p><strong>类型:</strong> {{ getTypeLabel(selectedNotice.type) }}</p>
                    <p><strong>内容:</strong></p>
                    <p>{{ selectedNotice.content }}</p>
                    <CloseIcon class="close-button" @click="selectedNotice = null" />
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { CloseIcon } from 'tdesign-icons-vue-next';

const props = defineProps({
    noticeList: {
        type: Array,
        required: true,
    },
});

const emit = defineEmits(['close']);

const selectedNotice = ref(null); // 当前选中的通知详情

const closeTable = () => {
    emit('showForm', 'notice', false);
};

const formatTime = (time) => {
    const date = new Date(time);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const getTypeLabel = (type) => {
    switch (type) {
        case 'urgent':
            return '紧急';
        case 'important':
            return '重要';
        default:
            return '普通';
    }
};

const viewDetails = (notice) => {
    selectedNotice.value = notice; // 设置当前选中的通知
};
</script>

<style scoped lang="less">
.notification-table-container {
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

    .notification-table {
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

    .detail-button {
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
}

.notice-detail-modal {
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
        h3 {
            margin-top: 0;
        }

        p {
            margin: 10px 0;
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
}
</style>