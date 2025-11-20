<script setup>
import { computed, onMounted, ref } from 'vue';
import { useTaskStore } from '@/store/modules/tasks';
import socket from '@/services/socket';

import Header from '@/components/Header.vue';
import TaskBoard from '@/components/Taskboard.vue';
import TaskList from '@/components/TaskList.vue';
import TaskModal from '@/components/TaskModal.vue';
import CreateTaskModal from '@/components/CreateTaskModal.vue';

const taskStore = useTaskStore();
const viewMode = ref('board');
const searchQuery = ref('');
const statusFilter = ref('all');
const showTaskModal = ref('false');
const showCreateModal = ref('false');
const selectedTask = ref(null);
const onlineUsers = ref([]);
const notifications = ref([]);

const filteredTasks = computed(() => {
    let tasks = taskStore.tasks;

    // filter by status 
    if (statusFilter.value !== 'all') {
        tasks = tasks.filter(t => t.status === statusFilter.value);
    }

    // filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        tasks = tasks.filter(t => 
            t.title.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query)
        );
    }

    return tasks;
});

const openTaskModal = (task) => {
    selectedTask.value = task;
    showTaskModal.value = true;
};

const handleTaskUpdate = async (taskId, updates) => {
    await taskStore.updateTask(taskId, updates);
    showTaskModal.value = false;
};

const handleTaskCreate = async (taskData) => {
    await taskStore.createTask(taskData);
    showCreateModal.value = false;
};

onMounted(() => {
    taskStore.fetchTasks();

    // Listen for online user 
    socket.onUsersOnlinde((users) => {
        onlineUsers.value = users;
    });
});

</script>
<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <!-- Header -->
        <Header 
            :onlineUsers="onlineUsers"
            :notifications="notifications"
            @create-task="showCreateModal = true"
        />
        
        <!-- Main content -->
        <main class="max-w-7xl mx-auto px-6 py-8">
            <!-- Toolbar -->
             <div class="mb-6 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                        <button
                            @click="viewMode = 'board'"
                            :class="[
                                'px-4 py-2 rounded-md transition-colors',
                                viewMode === 'board' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                            ]"
                        >
                            Board
                        </button>
                        <button
                            @click="viewMode = 'list'"
                            :class="[
                                'px-4 py-2 rounded-md trasition-colors',
                                viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600'
                            ]"
                        >
                            List
                        </button>
                    </div>

                    <div class="relative">
                        <input
                            v-model="searchQuery"    
                            type="text"
                            placeholder="Search tasks..."
                            class="pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none w-64" 
                        />
                    </div>
                </div>

                <select
                    v-model="statusFilter"
                    class="px-4 py-2 bg-white rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
                >
                    <option value="all">All Status</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
             </div>

             <!-- Task Board/List View -->
             <TaskBoard 
                v-if="viewMode === 'board'"
                :tasks="filteredTasks"
                @task-click="openTaskModal"
             />
             <TaskList 
                v-else
                :tasks="filteredTasks"
                @task-click="openTaskModal"
             />
        </main>

        <!-- Task Modal -->
        <TaskModal 
            v-if="showTaskModal"
            :task="selectedTask"
            @close="showTaskModal = false"
            @update="handleTaskUpdate"
        />

        <!-- Create task modal -->
        <CreateTaskModal 
            v-if="showCreateModal"
            @close="showCreateModal = false"
            @create="handleTaskCreate"
        />
    </div>
</template>

