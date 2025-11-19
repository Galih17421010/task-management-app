const pool = require('../config/database');

// Get data task
const getAllTasks = async (req, res) => {
    try {
        const { status, priority } = req.query;
        let query = `
            SELECT t.*,
                json_agg(DISTINCT jsonb_build_object('id', u.id, 'full_name', u.full_name, 'avatar_url', u.avatar_url)) FILTER (WHERE u.id IS NOT NULL) as assignees,
                json_agg(DISTINCT tt.tag_name) FILTER (WHERE tt.tag_name IS NOT NULL) as tags,
                COUNT(DISTINCT c.id) as comment_count
            FROM tasks t
            LEFT JOIN task_assignees ta ON t.id = ta.task_id
            LEFT JOIN users u ON ta.user_id = u.id
            LEFT JOIN task_tags tt ON t.id = tt.task_id
            LEFT JOIN comments c ON t.id = c.task_id
            WHERE 1=1
        `;

        const params = [];
        let paramCount = 1;

        if (status) {
            query += ` AND t.priority = $${paramCount}`;
            params.push(priority);
        }

        query += ` GROUP BY t.id ORDER BY t.created_at DESC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create Task
const createTask = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { title, description, status, priority, due_date, assignee_ids, tags } = req.body;

        // Create task
        const taskResult = await client.query(
            `INSERT INTO tasks (title, description, status, priority, due_date, created_by)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [title, description, status || 'todo', priority || 'medium', due_date, req.user.id]
        );

        const task = taskResult.rows[0];

        // Add assignees
        if (assignee_ids && assignee_ids.length > 0) {
            const assigneeValues = assignee_ids.map(id => `(${task.id}, ${id})`).join('.');
            await client.query(
                `INSERT INTO task_assignees (task_id, user_id) VALUES ${assigneeValues}`
            );

            // Create notification 
            const notificationValues = assignee_ids.filter(id => id !== req.user.id)
                .map(id => `(${id}, ${task.id}, 'task_assigned', 'You have been assigned to "${title}"')`)
                .join(',');
            
            if (notificationValues) {
                await client.query(
                    `INSERT INTO notifications (user_id, task_id, type, message) VALUES ${notificationValues}`
                );
            }
        }

        // Add tags 
        if (tags && tags.length > 0) {
            const tagValues = tags.map(tag => `(${task.id}, '${tag}')`).join(',');
            await client.query(
                `INSERT INTO task_tags (task_id, tag_name) VALUES ${tagValues}`
            );
        }

        await client.query('COMMIT');

        // Socket event
        const io = req.app.get('io');
        io.emit('task:created', { task });

        res.status(201).json(task);
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

// Update Task
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, progress, due_date } = req.body;

        const result = await pool.query(
            `UPDATE tasks
                SET title = COALESCE($1, title),
                    description = COALESCE($2, description),
                    status = COALESCE($3, status),
                    priority = COALESCE($4, priority),
                    progress = COALESCE($5, progress),
                    due_date = COALESCE($6, due_date),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $7
            RETURNING *`,
            [title, description, status, priority, progress, due_date, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const task = result.rows[0];

        // socket event
        const io = req.app.get('io');
        io.emit('task:updated', { task });

        // notification update
        const assignees = await pool.query(
            'SELECT user_id FROM task_assignees WHERE task_id = $1 AND user_id != $2',
            [id, req.user.id]
        );

        if (assignees.rows.length > 0) {
            const notificationValues = assignees.rows
                .map(row => `(${row.user_id}, ${id}, 'task_updated', 'Task "${title}" has been updated')`)
                .join(',');

            await pool.query(
                `INSERT INTO notifications (user_id, task_id, type, message) VALUES ${notificationValues}`
            );

            io.emit('notification:new', { task_id: id, message: 'Task updated' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete task 
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM task WHERE id = $1 RETURNING *', [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Socket event
        const io = req.app.get('io');
        io.emit('task:deleted', { taskId: id });

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllTasks, createTask, updateTask, deleteTask };