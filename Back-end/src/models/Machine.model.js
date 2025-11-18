import mongoose from 'mongoose';

/**
 * ========================================
 * MACHINE SCHEMA
 * ========================================
 */
const MachineSchema = new mongoose.Schema({
    machineId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['CNC Machine', 'Powder Filling Machine', 'Spray Machine', 'Salt Filling Machine']
    },
    location: {
        type: String,
        default: 'N/A'
    },
    description: {
        type: String,
        default: ''
    },
    ip: {
        type: String,
        required: true
    },
    port: {
        type: Number,
        default: 502
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'running', 'error'],
        default: 'offline'
    },
    isConnected: {
        type: Boolean,
        default: false
    },
    lastUpdate: {
        type: Date,
        default: Date.now
    },
    lastHeartbeat: {
        type: Date,
        default: Date.now
    },
    parameters: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes
MachineSchema.index({ machineId: 1 });
MachineSchema.index({ userId: 1 });
MachineSchema.index({ type: 1 });

export default mongoose.model('Machine', MachineSchema);
