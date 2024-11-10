const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const nodemailer = require('nodemailer');
const app = express();
const PORT = 3000;

// Middleware to parse JSON data
app.use(express.json());

// Initialize SQLite Database
const db = new sqlite3.Database('./tickets.db', (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Create Tickets Table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        urgency TEXT NOT NULL,
        category TEXT NOT NULL,
        status TEXT DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error("Error creating tickets table:", err.message);
    }
});

// Create Users Table for Authentication
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user'
    )
`, (err) => {
    if (err) {
        console.error("Error creating users table:", err.message);
    }
});

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Role-Based Authorization Middleware for Admin Access
function authorizeAdmin(req, res, next) {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    next();
}

// User Registration Route
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
        [username, hashedPassword, role || 'user'],
        function (err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ message: 'User registered successfully' });
        });
});

// User Login Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(401).json({ error: 'Invalid credentials' });

        // Generate JWT
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
});

// Protected Route to Get All Tickets for Logged-in Users
app.get('/tickets', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM tickets`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ tickets: rows });
    });
});

// Create Ticket Route
app.post('/tickets', authenticateToken, (req, res) => {
    const { title, description, urgency, category, email } = req.body;

    db.run(
        `INSERT INTO tickets (title, description, urgency, category) VALUES (?, ?, ?, ?)`,
        [title, description, urgency, category],
        function (err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }

            // Send confirmation email
            const ticketId = this.lastID;
            sendEmail(
                email,
                'Ticket Submitted Successfully',
                `Your ticket (#${ticketId}) titled "${title}" has been submitted and will be reviewed shortly.`
            );

            res.status(201).json({ ticketId });
        }
    );
});

// Protected Route to Update Ticket Status for Admins Only
app.put('/tickets/:id', authenticateToken, authorizeAdmin, (req, res) => {
    const ticketId = req.params.id;
    const { status } = req.body;

    db.run(
        `UPDATE tickets SET status = ? WHERE id = ?`,
        [status, ticketId],
        function (err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ updated: this.changes });
        }
    );
});

// Protected Route to Delete a Ticket for Admins Only
app.delete('/tickets/:id', authenticateToken, authorizeAdmin, (req, res) => {
    const ticketId = req.params.id;

    db.run(`DELETE FROM tickets WHERE id = ?`, [ticketId], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ deleted: this.changes });
    });
});

// Configuring the Email Service
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
    }
});

function sendEmail(to, subject, text) {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to,
        subject,
        text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
}

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
