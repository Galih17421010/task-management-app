import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(token) {
        this.socket = io(SOCKET_URL, {
            auth: { token }
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    // Task event 
    onTaskCreated(callback) {
        this.socket?.on('task:created', callback);
    }

    onTaskUpdated(callback) {
        this.socket?.on('task:updated', callback);
    }

    onTaskDeleted(callback) {
        this.socket?.on('task:deleted', callback);
    }

    onProgressUpdated(callback) {
        this.socket?.on('task:progress-updated', callback);
    }

    updateProgress(taskId, progress) {
        this.socket?.emit('task:update-progress', { taskId, progress });
    }

    // Comment event 
    onCommentAdded(callback) {
        this.socket?.on('comment:added', callback);
    }

    addComment(taskId, content) {
        this.socket?.emit('comment:add', { taskId, content });
    }

    // User event 
    onUsersOnlinde(callback) {
        this.socket?.on('users:online', callback);
    }

    // Notification event
    onNotification(callback) {
        this.socket?.on('notification:new', callback);
    }
}

export default new SocketService();