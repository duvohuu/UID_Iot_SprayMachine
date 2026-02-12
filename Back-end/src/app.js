import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './api/routes/authRoutes.js';
import userRoutes from './api/routes/userRoutes.js';
import machineRoutes from './api/routes/machineRoutes.js';
import sprayMachineRoutes from './api/routes/sprayMachineRoutes.js';
import notificationRoutes from './api/routes/notificationRoutes.js';

const app = express();

// ==================== MIDDLEWARE ====================

// Parse CORS origins from .env (comma-separated string → array)
const corsOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5173'];

console.log('🌐 CORS Origins:', corsOrigins);
console.log('🔒 NODE_ENV:', process.env.NODE_ENV); 

app.use(cors({
    origin: corsOrigins, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'] 
}));

app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==================== ROUTES ====================

// Authentication routes (Public)
app.use('/api/auth', authRoutes);

// User routes (Protected)
app.use('/api/users', userRoutes);

// Machine routes (Protected)
app.use('/api/machines', machineRoutes);

// Spray Machine data routes
app.use('/api/spray-machine', sprayMachineRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// ==================== HEALTH CHECK ====================
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'IoT Spray Machine API Server',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        corsOrigins: corsOrigins,
        cookieSettings: {
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        }
    });
});

app.get('/health', (req, res) => {
    const vnNow = new Date(new Date().getTime() + (7 * 60 * 60 * 1000));
    const vnDate = vnNow.toISOString().split('T')[0];
    
    // Log minimal để không spam console
    console.log(`🏥 [Health] Ping from ${req.ip} at ${vnNow.toISOString()}`);
    
    // Trả về response nhanh
    res.json({
        status: 'alive',
        timestamp: vnNow.toISOString(),
        date: vnDate,
        uptime: Math.floor(process.uptime()),
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
    });
});

// ==================== 404 HANDLER ====================
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`
    });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

export default app;