const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const bcrypt = require('../../node_modules/bcryptjs/umd/types');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
    console.log('Database connected successfully');
});

module.exports = pool;
// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user 
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check password 
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update online status 
        await pool.query(
            'UPDATE users SET is_online = true, last_seen = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        // Token generate
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                avatar_url: user.avatar_url 
            },
           token 
        });

    } catch (error) {
        res.status(500).json({ error: error.massage });
    }
};

module.exports = { register, login };
