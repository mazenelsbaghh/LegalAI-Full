
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const SECRET_KEY = 'your-secret-key';

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./legal_ai.db');

// JWT middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Login route with JWT
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY);
        res.json({ token, user });
    });
});

// Get logged in user
app.get('/api/auth/me', authenticateToken, (req, res) => {
    db.get("SELECT * FROM users WHERE id = ?", [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(user);
    });
});

// Get all cases for lawyer or admin
app.get('/api/cases', authenticateToken, (req, res) => {
    const query = req.user.role === 'lawyer'
        ? "SELECT * FROM cases WHERE lawyer_id = ?"
        : "SELECT * FROM cases";
    const params = req.user.role === 'lawyer' ? [req.user.id] : [];
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

// Add a new case
app.post('/api/cases', authenticateToken, (req, res) => {
    const { title, description, client_id } = req.body;
    db.run("INSERT INTO cases (title, description, lawyer_id, client_id) VALUES (?, ?, ?, ?)",
        [title, description, req.user.id, client_id], function (err) {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json({ caseId: this.lastID });
        });
});

// Get chat history for a case
app.get('/api/cases/:id/chat', authenticateToken, (req, res) => {
    db.all("SELECT * FROM chat_history WHERE case_id = ?", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

// Add chat message
app.post('/api/cases/:id/chat', authenticateToken, (req, res) => {
    const { message, sender } = req.body;
    db.run("INSERT INTO chat_history (case_id, message, sender) VALUES (?, ?, ?)",
        [req.params.id, message, sender], function (err) {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json({ success: true });
        });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
