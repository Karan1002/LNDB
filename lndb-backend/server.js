const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Karan@12345',
    database: 'lndb'
});

db.connect(err => {
    if (err) console.log('DB Connection Failed ❌', err);
    else console.log('DB Connected ✅');
});

// Register route
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    db.query(query, [name, email, password], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email already exists!' });
            return res.status(500).json({ message: 'Database error!' });
        }
        res.json({ message: 'Registration successful!' });
    });
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE (email=? OR name=?) AND password=?`;
    db.query(query, [username, username, password], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error!' });
        if (results.length === 0) return res.status(400).json({ message: 'Invalid credentials!' });
        res.json({ message: 'Login successful!', name: results[0].name });
    });
});

app.listen(5000, () => console.log('Server running on port 5000'));
