<script setup>
import { onMounted, reactive, ref } from 'vue';
import socket from '@/services/socket';
import api from '@/services/api';

const props = defineProps({
    task: Object  
});

const emit = defineEmits(['close', 'update']);
const localTask = reactive({ ...props.task });
const comment = ref([]);
const newComment = ref('');

const updateTask = () => {
    emit('update', localTask.id, {
        status: localTask.status,
        priority: localTask.priority,
        due_date: localTask.due_date
    });
};

const updateProgress = () => {
    socket.updateProgress(localTask.id, parseInt(localTask.progress));
    emit('update', localTask.id, { progress: localTask.progress });
};

const addComment = () => {
    if (!newComment.value.trim()) return;   
    
    socket.addComment(localTask.id, newComment.value);
    newComment.value = '';
};

const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUppercase();
};

const formatTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hour ago`;
    return `${Math.floor(minutes / 1440)} days ago`;
};

onMounted(async () => {
    // Load comments
    const response = await api.getComments(localTask.id);
    comment.value = response.data;

    // Listen new comment 
    socket.onCommentAdded((data) => {
        if (data.taskId === localTask.id) {
            comment.value.push(data.comment);
        }
    });
});
</script>
<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-200">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ task.title }}</h2>
                        <p class="text-gray-600">{{ task.description }}</p>
                    </div>
                    <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
                        x
                    </button>
                </div>
            </div>

            <div class="p-6 space-y-6">
                <!-- Status & Priority -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-sm font-semibold text-gray-700 block mb-2">Status</label>
                        <select 
                        v-model="localTask.status"
                        @change="updateTask"
                        class="w-full px-3 py-2 rounded-lg border-2 border-gray-300">
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label class="text-sm font-semibold text-gray-700 block mb-2">Priority</label>
                        <select 
                        v-model="localTask.priority"
                        @change="updateTask"
                        class="w-full px-3 py-2 rounded-lg border-2 border-gray-300">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>

                <!-- Progress -->
                <div>
                   <label class="text-sm font-semibold text-gray-700 block mb-2">Progress</label>
                   <div class="flex items-center gap-4">
                       <input
                           v-model="localTask.progress"
                           @change="updateProgress" 
                           type="range" 
                           min="0"
                           max="100"
                           class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                       />
                       <span class="text-lg font-semibold text-gray-900 w-12">
                           {{ localTask.progress }}%
                       </span>
                   </div>
                </div>

                <!-- Due Date -->
                <div>
                    <label class="text-sm font-semibold text-gray-700 block mb-2">Due Date</label>
                    <input 
                        v-model="localTask.due_date"
                        @change="updateTask"
                        type="date"
                        class="px-3 py-2 rounded-lg border-2 border-gray-300"
                    />
                </div>

                <!-- Comment section -->
                <div>
                    <label class="text-sm font-semibold text-gray-700 block mb-2">Comment</label>
                    <div class="space-y-3">
                        <div
                            v-for="comment in comments"
                            :key="comment.id" 
                            class="flex gap-3"
                        >
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                                {{ getInitials(comment.user.full_name) }}
                            </div>
                            <div class="flex-1 bg-gray-50 rounded-lg p-3">
                                <div class="flex items-center justify-between mb-1">
                                    <span class="font-semibold text-sm">{{ comment.user.full_name }}</span>
                                    <span class="text-xs text-gray-500">{{ formatTime(comment.created_at) }}</span>
                                </div>
                                <p class="text-sm text-gray-700">{{ comment.content }}</p>
                            </div>
                        </div>

                        <div class="flex gap-3">
                            <textarea 
                                v-model="newComment"
                                @keydown.enter.ctrl="addComment"
                                placeholder="Add a comment... (Ctrel+Enter to send)"
                                class="flex-1 px-3 py-2 rounded-lg border-2 border-gray-300 focus:outline-none realize-none"
                                rows="2"
                            ></textarea>
                            <button
                                @click="addComment"
                                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Send 
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>