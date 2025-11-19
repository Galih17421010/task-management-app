const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getAllTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

router.get('/', authenticate, getAllTasks);
router.post('/', authenticate, createTask);
router.put('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask);

module.exports = router;