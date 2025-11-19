const jwt = require('jsonwebtoken');
const pool = require('../config/database');

module.exports = (io) => {
    // Socket auth middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const result = await pool.query(
                'SELECT id, emailm full_name FROM users WHERE id = $1',
                [decoded.userId]
            );

            if (result.rows.length === 0) {
                return next(new Error('User not found'));
            }

            socket.userId = decoded.userId;
            socket.user = result.rows[0];
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket) => {
        console.log(`Use connected: ${socket.user.full_name} (${socket.userId})`);
        
        // update user online status
        await pool.query(
            'UPDATE users SET is_online = true, last_seen = CURRENT_TIMESTAMP WHERE id = $1',
            [socket.userId]
        );

        // Broadcast online user 
        const onlineUsers = await pool.query(
            'SELECT id, full_name, avatar_url FROM users WHERE is_online = true'
        );
        io.emit('user:online', onlineUsers.rows);

        // socket join personal room
        socket.join(`user:${socket.userId}`);

        // task update with real-time progress
        socket.on('task:update-progress', async (data) => {
            try {
                const { taskId, progress } = data;
                await pool.query(
                    'UPDATE tasks SET progress = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                    [progress, taskId]
                );

                // Broadcast all client 
                io.emit('task:progress-updated', { taskId, progress, updatedBy: socket.user });
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Real-time comment 
        socket.on('comment:add', async (data) => {
            try {
                const { taskId, content } = data;
                const result = await pool.query(
                    'INSERT INTO comments (task_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
                    [taskId, socket.userId, content]
                );

                const comment = {
                    ...result.rows[0], user: socket.id
                };

                // Broadcast all client 
                io.emit('comment:added', { taskId, comment });

                // Notify task assignees
                const assignees = await pool.query(
                    'SELECT user_id FROM task_assignees WHERE task_id = $1 AND user_id != $2',
                    [taskId, socket.userId]
                );

                assignees.rows.forEach(row => {
                    io.to(`user:${row.user_id}`).emit('notification:new', {
                        type: 'comment_added',
                        message: `${socket.user.full_name} commented on a task`,
                        taskId
                    });
                });
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // User typing indicator 
        socket.on('task:typing', (data) => {
            socket.broadcast.emit('task:user-typing', {
                taskId: data.taskId,
                user: socket.user
            });
        });

        // Disconnect handler
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.user.full_name}`);

            await pool.query(
                'UPDATE users SET is_online = false, last_seen = CURRENT_TIMESTAMP WHERE id = $1',
                [socket.userId]
            );

            // Broadcast updated online 
            const onlineUsers = await pool.query(
                'SELECT id, full_name, avatar_url FROM users WHERE is_online = true'
            );
            io.emit('users:online', onlineUsers.rows);
        });
    });
};