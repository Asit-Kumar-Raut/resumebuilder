const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Successfully connected to MongoDB!"))
    .catch(err => console.error("MongoDB connection error:", err));

// User Model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, unique: true },
    otp: { type: String },
    otpExpires: { type: Date },
    resumes: [{ type: Object }]
});

const User = mongoose.model('User', UserSchema);

// Multer Setup for Image Uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'photo-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Nodemailer Setup
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Auth Middleware
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

// --- Routes ---

// Send OTP
app.post('/api/otp/send', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        console.log(`Attempting to send OTP to: ${email}`);
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: 'ASIT Resume Builder - Your OTP',
            text: `Your OTP is: ${otp}. It expires in 10 minutes.`
        });
        console.log(`OTP successfully sent to: ${email}`);
        res.json({ msg: 'OTP sent', otp });
    } catch (err) {
        console.error("FULL MAILER ERROR:", err);
        res.status(500).json({ msg: 'Error sending email', error: err.message });
    }
});

// Register
app.post('/api/register', async (req, res) => {
    const { username, password, email, firstName, lastName } = req.body;
    try {
        let userByUsername = await User.findOne({ username });
        if (userByUsername) return res.status(400).json({ msg: 'Username already exists' });

        let userByEmail = await User.findOne({ email });
        if (userByEmail) return res.status(400).json({ msg: 'Email already exists' });

        let user = new User({ username, password, email, firstName, lastName });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, username: user.username } });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).send('Server error');
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, username: user.username } });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Forgot Password - Step 1: Send OTP
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User with this email not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 600000; // 10 mins
        await user.save();

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: 'ASIT Resume Builder - Password Reset OTP',
            text: `Your password reset OTP is: ${otp}`
        });

        res.json({ msg: 'Reset OTP sent' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Forgot Password - Step 2: Reset
app.post('/api/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ msg: 'Invalid or expired OTP' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Photo Upload
app.post('/api/upload-photo', auth, upload.single('photo'), (req, res) => {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
    res.json({ url: `/uploads/${req.file.filename}` });
});

// Resume Operations
app.post('/api/resumes', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.resumes.push(req.body);
        await user.save();
        res.json(user.resumes);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.get('/api/resumes', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user.resumes);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Download Notification
app.post('/api/notify-download', auth, async (req, res) => {
    const { resumeTitle } = req.body;
    try {
        const user = await User.findById(req.user.id);
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER, // Send to the same admin email
            subject: '🔔 New Resume Download!',
            text: `User ${user.firstName} ${user.lastName} (${user.username}) has just downloaded their resume: ${resumeTitle || 'Untitled'}.`
        });
        res.json({ msg: 'Notification sent' });
    } catch (err) {
        console.error("Notification Error:", err);
        res.status(500).send('Error');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
