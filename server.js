// Load environment variables
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const session = require('express-session');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3001',
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'codespace_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 3600000, // 1 hour
    secure: process.env.NODE_ENV === 'production'
  }
}));

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Acharya12$',
  database: process.env.DB_NAME || 'codespace_db'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ Connected to MySQL database');
});

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.status(403).json({ error: 'Not authorized' });
};

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', username);
  
  db.query('SELECT * FROM users WHERE username = ? AND password = ?', 
    [username, password], 
    (err, results) => {
      if (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Database error' });
      } else if (results.length > 0) {
        // Store user info in session
        req.session.userId = results[0].id;
        req.session.username = results[0].username;
        req.session.isAdmin = results[0].is_admin === 1;
        
        console.log('User found:', results[0].username);
        console.log('Is admin:', results[0].is_admin === 1);
        
        // Update last login time
        db.query('UPDATE users SET last_active = NOW() WHERE id = ?', [results[0].id]);
        
        res.json({ 
          success: true,
          isAdmin: results[0].is_admin === 1,
          username: results[0].username
        });
      } else {
        console.log('Invalid credentials');
        res.status(401).json({ message: 'Invalid credentials' });
      }
    }
  );
});

// Check admin status
app.get('/check-admin', isAuthenticated, (req, res) => {
  res.json({ isAdmin: req.session.isAdmin });
});

// Code Analysis using local LLM (Ollama)
app.post('/analyze-code', isAuthenticated, async (req, res) => {
  const { code } = req.body;
  const userId = req.session.userId;

  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'gemma2:2b';
    
    const response = await axios.post(`${ollamaUrl}/api/generate`, {
      model: ollamaModel,
      prompt: `Review this code:\n${code}\nProvide feedback on any issues.`,
      stream: false
    }, {
      timeout: 120000 // 120 seconds timeout
    });

    const feedback = response.data.response.trim();
    
    // Store the code and analysis in database
    db.query(
      'INSERT INTO saved_code (user_id, code_content, analysis_result, created_at) VALUES (?, ?, ?, NOW())',
      [userId, code, feedback],
      (err) => {
        if (err) {
          console.error('Error saving code analysis:', err);
        }
      }
    );

    res.json({ feedback });
  } catch (error) {
    console.error('LLM Error:', error.message);
    res.status(500).json({ error: 'Failed to analyze code: ' + error.message });
  }
});

// Save code route
app.post('/save-code', isAuthenticated, (req, res) => {
  const { code } = req.body;
  const userId = req.session.userId;
  
  db.query(
    'INSERT INTO saved_code (user_id, code_content, created_at) VALUES (?, ?, NOW())',
    [userId, code],
    (err, results) => {
      if (err) {
        console.error('Save code error:', err);
        res.status(500).json({ error: 'Failed to save code to database' });
      } else {
        res.json({ success: true, message: 'Code saved successfully' });
      }
    }
  );
});

// Get user's saved code
app.get('/get-saved-code', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  
  db.query(
    'SELECT * FROM saved_code WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Get saved code error:', err);
        res.status(500).json({ error: 'Failed to retrieve saved code' });
      } else {
        res.json({ success: true, codes: results });
      }
    }
  );
});

// Get a specific code entry
app.get('/get-code/:id', isAuthenticated, (req, res) => {
  const codeId = req.params.id;
  const userId = req.session.userId;
  
  db.query(
    'SELECT * FROM saved_code WHERE id = ? AND (user_id = ? OR ? IN (SELECT id FROM users WHERE is_admin = 1))',
    [codeId, userId, userId],
    (err, results) => {
      if (err) {
        console.error('Get code error:', err);
        res.status(500).json({ error: 'Failed to retrieve code' });
      } else if (results.length === 0) {
        res.status(404).json({ error: 'Code not found' });
      } else {
        res.json({ success: true, code: results[0] });
      }
    }
  );
});

// Delete a code entry
app.delete('/delete-code/:id', isAuthenticated, (req, res) => {
  const codeId = req.params.id;
  const userId = req.session.userId;
  
  // Only allow deletion of own code unless admin
  const query = req.session.isAdmin
    ? 'DELETE FROM saved_code WHERE id = ?'
    : 'DELETE FROM saved_code WHERE id = ? AND user_id = ?';
  
  const params = req.session.isAdmin ? [codeId] : [codeId, userId];
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Delete code error:', err);
      res.status(500).json({ error: 'Failed to delete code' });
    } else if (results.affectedRows === 0) {
      res.status(403).json({ error: 'Not authorized to delete this code' });
    } else {
      res.json({ success: true });
    }
  });
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// ADMIN ROUTES

// Get dashboard stats
app.get('/admin/dashboard-stats', isAuthenticated, isAdmin, (req, res) => {
  const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM users WHERE is_admin = 0) AS totalStudents,
      (SELECT COUNT(*) FROM saved_code) AS totalSubmissions,
      (SELECT COUNT(DISTINCT id) FROM users 
       WHERE last_active >= DATE_SUB(NOW(), INTERVAL 1 DAY) AND is_admin = 0) AS activeToday
  `;
  
  db.query(statsQuery, (err, results) => {
    if (err) {
      console.error('Stats query error:', err);
      res.status(500).json({ error: 'Failed to retrieve dashboard stats' });
    } else {
      res.json({
        totalStudents: results[0].totalStudents,
        totalSubmissions: results[0].totalSubmissions,
        activeToday: results[0].activeToday
      });
    }
  });
});

// Get all students
app.get('/admin/students', isAuthenticated, isAdmin, (req, res) => {
  const query = `
    SELECT 
      u.id, 
      u.username, 
      u.last_active,
      COUNT(sc.id) AS submission_count
    FROM 
      users u
    LEFT JOIN 
      saved_code sc ON u.id = sc.user_id
    WHERE 
      u.is_admin = 0
    GROUP BY 
      u.id
    ORDER BY 
      u.last_active DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Students query error:', err);
      res.status(500).json({ error: 'Failed to retrieve students' });
    } else {
      res.json({ success: true, students: results });
    }
  });
});

// Search students
app.get('/admin/search-student', isAuthenticated, isAdmin, (req, res) => {
  const searchTerm = `%${req.query.term}%`;
  
  const query = `
    SELECT 
      u.id, 
      u.username, 
      u.last_active,
      COUNT(sc.id) AS submission_count
    FROM 
      users u
    LEFT JOIN 
      saved_code sc ON u.id = sc.user_id
    WHERE 
      u.is_admin = 0 AND u.username LIKE ?
    GROUP BY 
      u.id
    ORDER BY 
      u.last_active DESC
  `;
  
  db.query(query, [searchTerm], (err, results) => {
    if (err) {
      console.error('Student search error:', err);
      res.status(500).json({ error: 'Failed to search students' });
    } else {
      res.json({ success: true, students: results });
    }
  });
});

// Get a student's codes
app.get('/admin/student-codes/:studentId', isAuthenticated, isAdmin, (req, res) => {
  const studentId = req.params.studentId;
  
  db.query(
    'SELECT * FROM saved_code WHERE user_id = ? ORDER BY created_at DESC',
    [studentId],
    (err, results) => {
      if (err) {
        console.error('Get student codes error:', err);
        res.status(500).json({ error: 'Failed to retrieve student codes' });
      } else {
        res.json({ success: true, codes: results });
      }
    }
  );
});

// Redirect to correct page after login
app.get('/redirect-after-login', isAuthenticated, (req, res) => {
  if (req.session.isAdmin) {
    res.json({ redirect: 'teacher-dashboard.html' });
  } else {
    res.json({ redirect: 'codespace.html' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});