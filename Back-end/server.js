import http from 'http';
import app from './src/app.js';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import { initializeSocket } from './src/config/socket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Connect to database
connectDB();

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
});