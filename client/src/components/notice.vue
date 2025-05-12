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
                            <!-- 管理员可以编辑 -->
                            <button v-if="isAdmin" class="edit-button" @click="changeDetail(notice)">编辑</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <!-- 详细通知弹窗 -->
            <div v-if="selectedNotice" class="notice-detail-modal">
                <div class="modal-content">
                    <h3 v-if="!isChange">{{ selectedNotice.title }}</h3>
                    <div v-else class="edit-title">
                        <strong>修改标题: </strong>
                        <t-input v-model="selectedNotice.title" placeholder="请输入标题" />
                    </div>
                    <p><strong>发布人:</strong> {{ selectedNotice.releaseName }}</p>
                    <p><strong>状态:</strong> {{ getStatus(selectedNotice.status) }}</p>
                    <p><strong>宿舍楼:</strong> {{ selectedNotice.buildingId }}</p>
                    <p><strong>时间:</strong> {{ formatTime(selectedNotice.createdTime) }}</p>
                    <p v-if="!isChange"><strong>类型:</strong> {{ getTypeLabel(selectedNotice.type) }}</p>
                    <div v-else class="edit-title">
                        <strong>修改类型:</strong>
                        <t-select v-model="selectedNotice.type"
                            :options="[{ label: '普通', value: 'normal' }, { label: '重要', value: 'important' }, { label: '紧急', value: 'urgent' }]" />
                    </div>
                    <p><strong>内容:</strong></p>
                    <p v-if="!isChange">{{ selectedNotice.content }}</p>
                    <t-input v-else v-model="selectedNotice.content" placeholder="请输入内容" />
                    <CloseIcon class="close-button" @click="selectedNotice = null" />
                </div>
                <button v-if="isChange" class="edit-button" @click="changeNotice">保存修改</button>
            </div>
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
const noticeList = computed(() => Store.noticeList);

const emit = defineEmits(['close']);

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

const getStatus = (status) => {
    switch (status) {
        case 'published':
            return '已发布';
        case 'changed':
            return '已修改';
        case 'canceled':
            return '已删除';
        default:
            return '未知状态';
    }
};

const isChange = ref(false);
const selectedNotice = ref(null); // 当前选中的通知详情
const viewDetails = (notice) => {
    isChange.value = false;
    selectedNotice.value = JSON.parse(JSON.stringify(notice));

};

const changeDetail = (notice) => {
    isChange.value = true;
    selectedNotice.value = JSON.parse(JSON.stringify(notice));
};

const changeNotice = async () => {
    const notice = {
        noticeId: selectedNotice.value.noticeId,
        status: 'changed',
        type: selectedNotice.value.type,
        readList: selectedNotice.value.readList,
        title: selectedNotice.value.title,
        content: selectedNotice.value.content,
    }
    const response = await Axios.post('/dorm/notifyMembers', notice);
    const data = response.data;
    MessagePlugin.success('通知修改成功！');
    console.log('通知发送结果:', notice, data);
    Store.getNoticeList()
    selectedNotice.value = null; // 关闭详情弹窗
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