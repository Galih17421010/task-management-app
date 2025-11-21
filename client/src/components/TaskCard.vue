<script setup>
const props = defineProps({
    task: Object 
});

defineEmits(['click']);

const getPriorityColor = (priority) => {
    const colors = {
        'low': 'bg-green-500',
        'medium': 'bg-yellow-500',
        'high': 'bg-red-500'
    };
    return colors[priority];
};

const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        month: 'short',
        day: 'numeric'
    });
};
</script>

<template>
    <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
    @click="$emit('click')">
        <div class="flex time-start justify-between mb-2">
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <span :class="['w-2 h-2 rounded-full', getPriorityColor(task.priority)]"></span>
                    <h3 class="font-semibold text-gray-600">{{ task.title }}</h3>
                    <p class="text-sm text-gray-600">{{ task.description }}</p>
                </div>
            </div>

            <div class="flex item-center gap-2 mb-3">
                <span v-for="tag in task.tags"
                :key="tag"
                class="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                    {{ tag }}
                </span>
            </div>

            <div class="mb-3">
                <div class="flex item-center justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span class="font-semibold">{{ task.progress }}%</span>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full duration-500"
                :style="{ width: `${task.progress}%` }">
                </div>
            </div>
        </div>

        <div class="flex item-center justify-between text-sm">
            <div class="flex item-center gap-2">
                <div class="flex -space-x-2">
                    <div
                    v-for="(assignee, idx) in task.assignees?.slice(0, 3)"
                    :key="idx" 
                    class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                    {{ getInitials(assignee.full_name) }}
                    </div>
                </div>
                <span v-if="task.assignees?.length > 3" class="text-xs text-gray-500">
                    +{{ task.assignee.length - 3 }}
                </span>
            </div>

            <div class="flex items-center gap-3 text-gray-500">
                <div class="flex items-center gap-1">
                    <span class="text-xs">💬</span>
                    <span class="text-xs">{{ task.comment_count || 0 }}</span>
                </div>
                <div class="flex items-center gap-1">
                    <span class="text-xs">📎</span>
                    <span class="text-xs">{{ task.attachment || 0 }}</span>
                </div>
                <div class="flex item-center gap-1">
                    <span class="text-xs">🕒</span>
                    <span class="text-xs">{{ formatDate(task.due_date) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>