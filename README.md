# task-management-app

task-management-app/
├── client/                    # Frontend Vue.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskBoard.vue
│   │   │   ├── TaskCard.vue
│   │   │   ├── TaskModal.vue
│   │   │   ├── NotificationPanel.vue
│   │   │   └── Header.vue
│   │   ├── views/
│   │   │   ├── Dashboard.vue
│   │   │   └── Login.vue
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── store/
│   │   │   ├── index.js
│   │   │   └── modules/
│   │   │       ├── tasks.js
│   │   │       ├── users.js
│   │   │       └── notifications.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Backend Express
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── socket.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── taskController.js
│   │   │   ├── commentController.js
│   │   │   └── notificationController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Task.js
│   │   │   ├── Comment.js
│   │   │   └── Notification.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── tasks.js
│   │   │   ├── comments.js
│   │   │   └── notifications.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── sockets/
│   │   │   └── taskSocket.js
│   │   └── server.js
│   ├── package.json
│   └── .env
│
└── database/
    └── migrations/
        ├── 001_create_users.sql
        ├── 002_create_tasks.sql
        ├── 003_create_comments.sql
        └── 004_create_notifications.sql