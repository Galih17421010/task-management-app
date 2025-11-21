<script setup>
import { computed } from 'vue';
import TaskCard from './TaskCard.vue';

const props = defineProps({
    tasks: Array 
});

defineEmits(['task-click']);

const statuses = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
];

const getTasksByStatus = (status) => {
    return props.tasks.filter(t => t.status === status);
};

const getStatusColor = (status) => {
    const colors = {
        'todo': 'bg-gray-100 text-gray-700 border-gray-300',
        'in-progress': 'bg-blue-100 text-blue-700 border-blue-300',
        'completed': 'bg-green-100 text-green-700 border-green-300'
    };
    return colors[status];
};
</script>
<template>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="status in statuses" :key="status.value" class="flex flex-col">
            <div :class="['p-3 rounded-t-lg border-2', getStatusColor(status.value)]">
                <h3 class="font-semibold flex item-center justify-between">
                    {{ status.label }}
                    <span class="text-sm font-normal">
                        {{ getTasksByStatus(status.value).length }}
                    </span>
                </h3>
            </div>

            <div class="flex-1 space-y-3 p-3 bg-gray-50 rounded-b-lg min-h-[400px]">
                <TaskCard 
                    v-for="task in getTasksByStatus(status.value)"
                    :key="task.id"
                    :task="task"
                    @click="$emit('task-click', task)"
                />
            </div>
        </div>
    </div>
</template>