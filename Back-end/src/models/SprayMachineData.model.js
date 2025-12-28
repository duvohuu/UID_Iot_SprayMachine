import mongoose from 'mongoose';

/**
 * ========================================
 * SPRAY MACHINE DATA SCHEMA
 * ========================================
 * Lưu dữ liệu hoạt động hàng ngày của Spray Machine
 * - Reset mỗi ngày lúc 6h sáng (start of work shift)
 * - Dữ liệu được cập nhật realtime từ MQTT
 * 
 * MQTT Format: { status: 0|1, powerConsumption: number }
 * - status: 0 = dừng, 1 = đang chạy
 * - powerConsumption: Tổng năng lượng tích lũy (kWh) - luôn tăng dần
 */
const SprayMachineDataSchema = new mongoose.Schema({
    // Machine reference
    machineId: {
        type: String,
        required: true,
        index: true,
        ref: 'Machine'
    },
    
    // Ngày làm việc (format: 'YYYY-MM-DD')
    date: {
        type: String,
        required: true,
        index: true
    },
    
    // ==================== THỜI GIAN ====================
    
    // Thời gian máy chạy (status = 1) trong ngày
    operatingTime: {
        type: Number, // Giờ (hours)
        default: 0,
        min: 0,
        max: 12 // Ca làm việc 6h-18h = 12h
    },
    
    // Thời gian máy dừng = 12h - operatingTime
    pausedTime: {
        type: Number, // Giờ (hours)
        default: 12,
        min: 0,
        max: 12
    },
    
    // ==================== NĂNG LƯỢNG ====================
    
    // Tổng năng lượng tiêu thụ TRONG NGÀY
    // = powerConsumption_hiện_tại - energyAtStartOfDay
    totalEnergyConsumed: {
        type: Number, // kWh
        default: 0,
        min: 0
    },
    
    // Năng lượng tích lũy vào lúc 0h00 hôm nay (để tính delta)
    energyAtStartOfDay: {
        type: Number, // kWh
        default: 0
    },
    
    // Năng lượng tích lũy hiện tại (từ MQTT)
    currentPowerConsumption: {
        type: Number, // kWh
        default: 0
    },
    
    // ==================== TRACKING STATUS ====================
    
    // Trạng thái hiện tại (0 = dừng, 1 = chạy)
    lastStatus: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    
    // Thời điểm status thay đổi lần cuối (để tính operating time)
    lastStatusChangeTime: {
        type: Date,
        default: Date.now
    },
    
    // ==================== METADATA ====================
    
    // Thời điểm cập nhật cuối
    lastUpdate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Tự động thêm createdAt, updatedAt
});

// ==================== INDEXES ====================

// Composite index cho query theo machineId + date
SprayMachineDataSchema.index({ machineId: 1, date: -1 });

// Unique constraint: 1 machine chỉ có 1 document cho 1 ngày
SprayMachineDataSchema.index({ machineId: 1, date: 1 }, { unique: true });

// ==================== EXPORT ====================

export default mongoose.model('SprayMachineData', SprayMachineDataSchema);