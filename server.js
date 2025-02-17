const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();
const bodyParser = require("body-parser");
const session = require("express-session"); // ✅ تأكد من استدعائه هنا

const app = express();
const port = process.env.PORT || 7000;

// Database Connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'portfolio_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

//  Database Tables Use .getConnection() from promise API
async function initializeDB() {
  const conn = await db.getConnection(); 
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        photo_path VARCHAR(255),
        description TEXT,
        total_libraries INT,
        main_features INT,
        live_demo VARCHAR(255),
        github_link VARCHAR(255),
        technologies JSON,
        key_features TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    conn.release(); 
  }
}
initializeDB();

//Nodemailer 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

//Multer 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed to be uploaded!'), false);
    }
  }
});

 
app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
//Multer Error Handling
app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(413).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE'
        ? 'File size exceeds 50MB!'
        : 'File upload error'
    });
  }
  next(err);
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// تسجيل الدخول
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      req.session.isAuthenticated = true;
      return res.json({ success: true });
  }
  res.json({ success: false });
});

// التحقق من الجلسة
app.get("/check-session", (req, res) => {
  if (req.session.isAuthenticated) {
      res.json({ isAuthenticated: true });
  } else {
      res.json({ isAuthenticated: false });
  }
});

// تسجيل الخروج
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
      res.json({ success: true });
  });
});
//Routes
app.delete('/projects/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete project', error: error.message });
  }
});


app.get('/comments', async (req, res) => {
  try {
      const connection = await db.getConnection();
      const [rows] = await connection.execute('SELECT * FROM comments');
      connection.release(); 
      res.json(rows);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


app.delete('/comments/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const connection = await db.getConnection();
      await connection.execute('DELETE FROM comments WHERE id = ?', [id]);
      connection.release();
      res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


// API To get projects and certificate Counter 
app.get("/counts", async (req, res) => {
  try {
    const [projects] = await db.query("SELECT COUNT(*) AS projectCount FROM projects");
    const [certificates] = await db.query("SELECT COUNT(*) AS certificateCount FROM certificates");

    res.json({
      projects: projects[0].projectCount,
      certificates: certificates[0].certificateCount
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.get('/projects', async (req, res) => {
  try {
    const [projects] = await db.query(`
      SELECT *, 
      CAST(technologies AS CHAR) AS technologies,
      CAST(key_features AS CHAR) AS key_features 
      FROM projects
      ORDER BY created_at DESC
    `);
    
    const formatted = projects.map(p => ({
      ...p,
      technologies: JSON.parse(p.technologies || "[]"),
      key_features: JSON.parse(p.key_features || "[]")
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load projects',
      error: error.message
    });
  }
});

app.get('/projects/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *, 
      CAST(technologies AS CHAR) AS technologies,
      CAST(key_features AS CHAR) AS key_features 
      FROM projects WHERE id = ?
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = {
      ...rows[0],
      technologies: JSON.parse(rows[0].technologies || "[]"),
      key_features: JSON.parse(rows[0].key_features || "[]")
    };

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve project',
      error: error.message
    });
  }
});



app.post('/projects', upload.single('photo'), async (req, res) => {
  try {
    const { name, description, totalLibraries, mainFeatures, liveDemo, githubLink, technologies, keyFeatures } = req.body;

    
    let parsedTechnologies;
    let parsedKeyFeatures;

    try {
      parsedTechnologies = JSON.parse(technologies); 
      parsedKeyFeatures = JSON.parse(keyFeatures); 
    } catch (e) {
      
      parsedTechnologies = typeof technologies === 'string' ? [technologies] : [];
      parsedKeyFeatures = typeof keyFeatures === 'string' ? [keyFeatures] : [];
    }

    const photoPath = req.file ? req.file.filename : null;

    
    const [result] = await db.query(
      `INSERT INTO projects 
      (name, photo_path, description, total_libraries, main_features, live_demo, github_link, technologies, key_features)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        photoPath,
        description,
        totalLibraries || 0, 
        mainFeatures || 0, 
        liveDemo,
        githubLink,
        JSON.stringify(parsedTechnologies), 
        JSON.stringify(parsedKeyFeatures) 
      ]
    );

    res.json({ message: 'Project added successfully!', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Comments Routes
app.post('/api/comments', upload.single('profile'), async (req, res) => {
  try {
    const { name, gender, message } = req.body;
    if (!name || !gender || !message) {
      return res.status(400).json({ error: 'All required fields' });
    }
    const profilePic = req.file?.filename || `${gender}_default.png`;
    const [result] = await db.query(
      `INSERT INTO comments 
      (name, gender, message, profile_picture) 
      VALUES (?, ?, ?, ?)`,
      [name, gender, message, profilePic]
    );
    res.json({
      id: result.insertId,
      name,
      gender,
      message,
      profile_picture: profilePic,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.get('/api/comments', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM comments ORDER BY created_at DESC');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching comments' });
  }
});

// Skills Routes
app.get('/api/skills', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM skills');
    res.json(results);
  } catch (err) {
    handleError(res, err, 'Error fetching Skills');
  }
});

// Certificates Routes
app.get('/api/certificates', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM certificates');
    res.json(results);
  } catch (err) {
    handleError(res, err, 'Error fetching Certificates');
  }
});

// Admin Routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.post('/addSkill', upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    const imageName = text + path.extname(req.file.originalname);
    const [result] = await db.query(
      'INSERT INTO skills (text, image) VALUES (?, ?)',
      [text, imageName]
    );
    await renameUploadedFile(req.file.filename, imageName);
    res.redirect('/admin');
  } catch (err) {
    handleError(res, err, 'Error adding skill');
  }
});

app.post('/addCertificate', upload.single('pdf'), async (req, res) => {
  try {
    const { name, link } = req.body;
    const pdfName = name + path.extname(req.file.originalname);
    const certificateLink = link ? link : null;
    const [result] = await db.query(
      'INSERT INTO certificates (name, pdf, link) VALUES (?, ?, ?)',
      [name, pdfName, certificateLink]
    );
    await renameUploadedFile(req.file.filename, pdfName);
    res.redirect('/admin');
  } catch (err) {
    handleError(res, err, 'Error adding Certificate');
  }
});

// Content Management Routes
app.get('/admin/skills', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM skills');
    res.json(results);
  } catch (err) {
    handleError(res, err, 'Error fetching skills for management');
  }
});

app.get('/admin/certificates', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM certificates');
    res.json(results);
  } catch (err) {
    handleError(res, err, 'Error fetching Certificates for management');
  }
});

app.delete('/removeSkill/:id', async (req, res) => {
  try {
    const [result] = await db.query('SELECT image FROM skills WHERE id = ?', [req.params.id]);
    if (!result.length) return res.status(404).send('Skills Not Found');
    const fileName = result[0].image;
    const filePath = path.join(__dirname, 'uploads', fileName);
    fs.unlinkSync(filePath); 
    await db.query('DELETE FROM skills WHERE id = ?', [req.params.id]);
    await db.query('ALTER TABLE skills AUTO_INCREMENT = 1');
    res.send('Delete and reset successfully');
  } catch (err) {
    handleError(res, err, 'Error deleting skill');
  }
});

app.delete('/removeCertificate/:id', async (req, res) => {
  try {
    const [result] = await db.query('SELECT pdf FROM certificates WHERE id = ?', [req.params.id]);
    if (!result.length) return res.status(404).send('Certificates Not Found');
    const fileName = result[0].pdf;
    const filePath = path.join(__dirname, 'uploads', fileName);
    fs.unlinkSync(filePath); 
    await db.query('DELETE FROM certificates WHERE id = ?', [req.params.id]);
    await db.query('ALTER TABLE certificates AUTO_INCREMENT = 1');
    res.send('Delete and reset successfully');
  } catch (err) {
    handleError(res, err, 'Error deleting Certificate');
  }
});

// Email Sending Route
app.post('/send-email', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Invalid data provided.' });
    }

    const userMailOptions = {
      from:  process.env.EMAIL_FROM,
      to: email,
      subject: 'Thank You for Contacting Us',
      html: `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Poppins', Arial, sans-serif;
                background-color: #f4f7f9;
                margin: 0;
                padding: 0;
                text-align: center;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: #fff;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
              }
              .header img {
                width: 120px;
                height: auto;
                margin-bottom: 10px;
              }
              h1 {
                color: #0056b3;
                font-size: 24px;
              }
              .content {
                color: #333;
                font-size: 16px;
                line-height: 1.6;
              }
              .message-box {
                background: #eef2f7;
                padding: 15px;
                border-radius: 8px;
                margin-top: 15px;
              }
              .button {
                display: inline-block;
                background: #007bff;
                color: #fff;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 6px;
                margin-top: 20px;
                transition: 0.3s ease-in-out;
              }
              .button:hover {
                background: #0056b3;
              }
              .footer {
                margin-top: 20px;
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                
                <h1>Thank You for Reaching Out</h1>
              </div>
              <div class="content">
                <p>Dear <strong>${name}</strong>,</p>
                <p>We have received your message and will get back to you shortly.</p>
                <div class="message-box">
                  <p><strong>Your Message:</strong></p>
                  <blockquote>${message}</blockquote>
                </div>
                <a href="https://example.com" class="border border-[#00ADB5] text-[#00ADB5] px-5 py-2 rounded-lg text-lg font-medium transition-colors hover:bg-[#00ADB5] hover:text-white">
    Visit Our Website
</a>

              </div>
              <div class="footer">
                <p>© 2025 Ahmed Nada™. All Rights Reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };
    const senderName = email.split('@')[0]; 
    const formattedName = `Client - ${senderName}`;
    const adminMailOptions = {
      from: `"${formattedName}" <${email}>`,
      to: process.env.EMAIL_TO,
      subject: `New Message from ${name}`,
      html: `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Poppins', Arial, sans-serif;
                background-color: #f4f7f9;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: #fff;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
              }
              h1 {
                color: #d9534f;
                font-size: 22px;
                text-align: center;
              }
              table {
                width: 100%;
                margin-top: 20px;
                border-collapse: collapse;
              }
              th, td {
                padding: 12px;
                border-bottom: 1px solid #ddd;
              }
              th {
                background: #f4f4f4;
                color: #0056b3;
              }
              td {
                color: #333;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>New Message Received</h1>
              <table>
                <tr><th>Name</th><td>${name}</td></tr>
                <tr><th>Email</th><td>${email}</td></tr>
                <tr><th>Message</th><td>${message}</td></tr>
              </table>
              <p style="text-align:center;">Reply to: <a href="mailto:${email}">${email}</a></p>
              <div class="footer">
                <p>© 2025 Ahmed Nada™. All Rights Reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);

    res.status(200).json({ success: true, message: 'Emails sent successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send emails.', details: error.message });
  }
});




//  Functions i used to show error 
function handleError(res, err, message) {
  console.error(err);
  res.status(500).send(message);
}

function renameUploadedFile(oldName, newName) {
  return new Promise((resolve, reject) => {
    const oldPath = path.join(__dirname, 'uploads', oldName);
    const newPath = path.join(__dirname, 'uploads', newName);
    fs.rename(oldPath, newPath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

















// Start Server
app.listen(port, () => {
  console.log(`Server is running on : http://localhost:${port}`);
});