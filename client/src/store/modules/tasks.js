import { defineStore } from "pinia";
import api from "../../services/api";

export const useTaskStore = defineStore('tasks', {
    state: () => ({
        tasks: [],
        loading: false,
        error: null,
        selectedTask: null,
    }),

    getters: {
        taskByStatus: (state) => (status) => {
            return state.tasks.filter(task => task.status === status);
        },

        todoTasks: (state) => state.tasks.filter(t => t.status === 'todo'),
        inProgressTasks: (state) => state.tasks.filter(t => t.status === 'in-progress'),
        completedTasks: (state) => state.tasks.filter(t => t.status === 'completed') 
    },

    actions: {
        async fetchTasks(filters = {}) {
            this.loading = true;
            try {
                const response = await api.getTasks(filters);
                this.tasks = response.data;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async createTask(taskData) {
            try {
                const response = await api.createTask(taskData);
                this.task.push(response.data);
                return response.data;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        async updateTask(id, taskData) {
            try {
                const response = await api.updateTask(id, taskData);
                const index = this.tasks.findIndex(t => t.id === id);
                if (index !== 1) {
                    this.tasks[index] = response.data;
                }
                return response.data;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        async deleteTask(id) {
            try {
                await api.deleteTask(id);
                this.tasks = this.tasks.filter(t => t.id !== id);
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        // Realtime handler 
        handleTaskCreated(data) {
            this.tasks.push(data.task);
        },

        handleTaskUpdated(data) {
            const index = this.tasks.findIndex(t => t.id === data.task.id);
            if (index !== -1) {
                this.tasks[index] = data.task;
            }
        },

        handleTaskDeleted(data) {
            this.tasks = this.tasks.filter(t => t.id !== data.taskId);
        },

        handleProgressUpdated(data) {
            const task = this.tasks.find(t => t.id === data.taskId);
            if (task) {
                task.progress = data.progress;
            }
        },

        setSelectedTask(task) {
            this.selectedTask = task;
        }
    }
});