<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import socket from '@/services/socket';
import { useTaskStore } from '@/store/modules/tasks';

const router = useRouter();
const taskStore = useTaskStore();

onMounted(() => {
 const token = localStorage.getItem('token');

 if (token) {
  // socket connection
  socket.connect(token);

  // Setup real-time listeners
  socket.onTaskCreated((data) => taskStore.handleTaskCreated(data));
  socket.onTaskUpdated((data) => taskStore.handleTaskUpdated(data));
  socket.onTaskDeleted((data) => taskStore.handleTaskDeleted(data));
  socket.onProgressUpdated((data) => taskStore.handleProgressUpdated(data));
 } else {
  router.push('/login');
 }
});

</script>

<style>
@import './assets/tailwind.css';
</style>