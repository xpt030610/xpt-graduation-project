<template>
    <div v-if="floorInfo.visible" class="overlay" @click="closeFloorPlan">
        <div class="floor-plan" @click.stop>
            <div class="stair left-stair">楼梯</div>
            <div class="stair right-stair">楼梯</div>
            <div class="hallway"></div>
            <div class="top">
                <div class="room" v-for="room in 10" :key="'left-' + room"> {{ room }}</div>
            </div>
            <div class="bottom">
                <div class="room" v-for="room in 10" :key="'right-' + room">
                    {{ room + 10 }}
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { defineEmits, defineProps } from 'vue';
const emit = defineEmits(['close']);
const props = defineProps({
    floorInfo: {
        type: Object,
        default: () => ({
            visible: false,
            buildingId: '',
            floorId: '',
        }),
    },
});
const closeFloorPlan = () => {
    emit('close');
};
</script>
<style scoped lang="less"></style>