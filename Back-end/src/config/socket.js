import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

let io;

export const initializeSocket = (server) => {
    const corsOrigins = process.env.CORS_ORIGINS 
        ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
        : ['http://localhost:5173'];

    console.log('🔌 Socket.IO CORS Origins:', corsOrigins);

    io = new Server(server, {
        cors: {
            origin: corsOrigins,  
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        transports: ['websocket', 'polling']
    });

    io.on('connection', (socket) => {
        console.log('✅ Socket.IO: Client connected -', socket.id);

        socket.on('join-machine', (machineId) => {
            socket.join(`machine-${machineId}`);
            console.log(`📡 Socket ${socket.id} joined machine-${machineId}`);
        });

        socket.on('leave-machine', (machineId) => {
            socket.leave(`machine-${machineId}`);
            console.log(`📤 Socket ${socket.id} left machine-${machineId}`);
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Socket.IO: Client disconnected -', socket.id, 'Reason:', reason);
        });

        socket.on('error', (error) => {
            console.error('🔥 Socket.IO error:', error);
        });
    });

    console.log('🔌 Socket.IO server initialized');
    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized!');
    }
    return io;
};

export const emitToMachine = (machineId, event, data) => {
    if (io) {
        io.to(`machine-${machineId}`).emit(event, data);
    }
};

export const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

export default { initializeSocket, getIO, emitToMachine, emitToAll };