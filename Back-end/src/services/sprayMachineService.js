import SprayMachineData from '../models/SprayMachineData.model.js';
import Machine from '../models/Machine.model.js';

/**
 * ========================================
 * SPRAY MACHINE SERVICE
 * ========================================
 * Business logic cho Spray Machine data
 * Xử lý MQTT messages và tính toán metrics
 */

/**
 * Lấy date string theo timezone Việt Nam (UTC+7)
 * @returns {string} Format: 'YYYY-MM-DD'
 */
const getVietnamDateString = () => {
    const now = new Date();
    // Chuyển sang UTC+7
    const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    return vnTime.toISOString().split('T')[0];
};

/**
 * Lấy hoặc tạo document cho hôm nay
 * @param {string} machineId 
 * @returns {Promise<SprayMachineData>}
 */
export const getTodayData = async (machineId) => {
    const today = getVietnamDateString();
    
    let data = await SprayMachineData.findOne({ 
        machineId, 
        date: today 
    });
    
    if (!data) {
        console.log(`📝 [Service] Creating new data for ${machineId} on ${today}`);
        
        // Tạo document mới cho ngày mới
        data = await SprayMachineData.create({
            machineId,
            date: today,
            operatingTime: 0,
            pausedTime: 12, // Ban đầu máy dừng cả 12h
            totalEnergyConsumed: 0,
            energyAtStartOfDay: 0,
            currentPowerConsumption: 0,
            lastStatus: 0,
            lastStatusChangeTime: new Date()
        });
    }
    
    return data;
};

/**
 * Xử lý MQTT message mới từ Spray Machine
 * @param {string} machineId 
 * @param {object} mqttData - { status: 0|1, powerConsumption: number }
 * @returns {Promise<SprayMachineData>}
 */
export const processMQTTUpdate = async (machineId, mqttData) => {
    try {
        const { status, powerConsumption } = mqttData;
        
        console.log(`📨 [Service] Processing MQTT for ${machineId}:`, { status, powerConsumption });
        
        // Validate input
        if (typeof status !== 'number' || (status !== 0 && status !== 1)) {
            throw new Error('Invalid status value. Must be 0 or 1');
        }
        
        if (typeof powerConsumption !== 'number' || powerConsumption < 0) {
            throw new Error('Invalid powerConsumption value. Must be >= 0');
        }
        
        // Lấy data hôm nay
        let data = await getTodayData(machineId);
        
        const now = new Date();
        
        // ==================== XỬ LÝ NĂNG LƯỢNG ====================
        
        // Lần đầu tiên trong ngày: set energyAtStartOfDay
        if (data.energyAtStartOfDay === 0 && powerConsumption > 0) {
            data.energyAtStartOfDay = powerConsumption;
            console.log(`🔋 [Service] Set energyAtStartOfDay = ${powerConsumption} kWh`);
        }
        
        // Cập nhật currentPowerConsumption
        data.currentPowerConsumption = powerConsumption;
        
        // Tính năng lượng tiêu thụ trong ngày
        if (data.energyAtStartOfDay > 0) {
            data.totalEnergyConsumed = Math.max(0, powerConsumption - data.energyAtStartOfDay);
        }
        
        console.log(`⚡ [Service] Energy: start=${data.energyAtStartOfDay}, current=${powerConsumption}, consumed=${data.totalEnergyConsumed}`);
        
        // ==================== XỬ LÝ OPERATING TIME ====================
        
        const previousStatus = data.lastStatus;
        const statusChanged = previousStatus !== status;
        
        // Case 1: Status thay đổi từ 0 → 1 (bắt đầu chạy)
        if (previousStatus === 0 && status === 1) {
            console.log(`▶️ [Service] Machine started running`);
            data.lastStatusChangeTime = now;
        }
        
        // Case 2: Status thay đổi từ 1 → 0 (dừng lại)
        if (previousStatus === 1 && status === 0) {
            // Tính thời gian đã chạy từ lần start trước đến giờ
            const runningTimeMs = now - new Date(data.lastStatusChangeTime);
            const runningTimeHours = runningTimeMs / (1000 * 60 * 60);
            
            // Cộng vào tổng operating time
            data.operatingTime += runningTimeHours;
            data.operatingTime = Math.min(data.operatingTime, 12); // Max 12h
            
            console.log(`⏸️ [Service] Machine stopped. Added ${runningTimeHours.toFixed(2)}h. Total: ${data.operatingTime.toFixed(2)}h`);
            
            data.lastStatusChangeTime = now;
        }
        
        // Case 3: Status = 1 và vẫn đang chạy (update realtime operating time)
        if (status === 1) {
            const currentRunTimeMs = now - new Date(data.lastStatusChangeTime);
            const currentRunTimeHours = currentRunTimeMs / (1000 * 60 * 60);
            
            // Tính tổng thời gian chạy (bao gồm đợt chạy hiện tại)
            const totalRunningTime = data.operatingTime + currentRunTimeHours;
            
            // Lưu ý: không lưu currentRunTime vào DB, chỉ tính khi query
            console.log(`🏃 [Service] Currently running. Base: ${data.operatingTime.toFixed(2)}h + Current: ${currentRunTimeHours.toFixed(2)}h = ${totalRunningTime.toFixed(2)}h`);
        }
        
        // Tính thời gian dừng (12h - operating)
        data.pausedTime = Math.max(0, 12 - data.operatingTime);
        
        // ==================== CẬP NHẬT METADATA ====================
        
        data.lastStatus = status;
        data.lastUpdate = now;
        
        // Lưu vào DB
        await data.save();
        
        console.log(`✅ [Service] Updated successfully for ${machineId}`);
        
        return data;
        
    } catch (error) {
        console.error(`❌ [Service] Error processing MQTT for ${machineId}:`, error);
        throw error;
    }
};

/**
 * Lấy operating time thực tế (bao gồm cả đợt chạy hiện tại)
 * @param {SprayMachineData} data 
 * @returns {number} Operating time in hours
 */
export const getCurrentOperatingTime = (data) => {
    let operatingTime = data.operatingTime;
    
    // Nếu máy đang chạy (status = 1), cộng thêm thời gian chạy hiện tại
    if (data.lastStatus === 1) {
        const now = new Date();
        const currentRunTimeMs = now - new Date(data.lastStatusChangeTime);
        const currentRunTimeHours = currentRunTimeMs / (1000 * 60 * 60);
        
        operatingTime += currentRunTimeHours;
        operatingTime = Math.min(operatingTime, 12);
    }
    
    return operatingTime;
};

/**
 * Lấy lịch sử 30 ngày
 * @param {string} machineId 
 * @returns {Promise<Array>}
 */
export const get30DaysHistory = async (machineId) => {
    const history = await SprayMachineData
        .find({ machineId })
        .sort({ date: -1 })
        .limit(30)
        .select('-__v -createdAt -updatedAt')
        .lean();
    
    return history;
};

/**
 * Lấy thống kê 30 ngày
 * @param {string} machineId 
 * @returns {Promise<object>}
 */
export const getStatistics = async (machineId) => {
    const history = await get30DaysHistory(machineId);
    
    if (history.length === 0) {
        return {
            totalOperatingTime: 0,
            totalPausedTime: 0,
            totalEnergyConsumed: 0,
            averageEfficiency: 0,
            daysCount: 0
        };
    }
    
    // Tính tổng
    const totalOperatingTime = history.reduce((sum, day) => sum + day.operatingTime, 0);
    const totalPausedTime = history.reduce((sum, day) => sum + day.pausedTime, 0);
    const totalEnergyConsumed = history.reduce((sum, day) => sum + day.totalEnergyConsumed, 0);
    
    // Tính efficiency trung bình
    const totalWorkTime = totalOperatingTime + totalPausedTime;
    const averageEfficiency = totalWorkTime > 0 
        ? (totalOperatingTime / totalWorkTime) * 100 
        : 0;
    
    return {
        totalOperatingTime: parseFloat(totalOperatingTime.toFixed(2)),
        totalPausedTime: parseFloat(totalPausedTime.toFixed(2)),
        totalEnergyConsumed: parseFloat(totalEnergyConsumed.toFixed(2)),
        averageEfficiency: parseFloat(averageEfficiency.toFixed(1)),
        daysCount: history.length
    };
};

/**
 * Reset data cho ngày mới (gọi từ cron job lúc 6h sáng)
 * @param {string} machineId 
 */
export const resetDailyData = async (machineId) => {
    const today = getVietnamDateString();
    
    try {
        // Kiểm tra xem đã có data cho hôm nay chưa
        const existingData = await SprayMachineData.findOne({ 
            machineId, 
            date: today 
        });
        
        if (existingData) {
            console.log(`⚠️ [Service] Data already exists for ${machineId} on ${today}`);
            return existingData;
        }
        
        // Lấy dữ liệu ngày hôm qua để lấy currentPowerConsumption làm energyAtStartOfDay
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDateStr = yesterday.toISOString().split('T')[0];
        
        const yesterdayData = await SprayMachineData.findOne({
            machineId,
            date: yesterdayDateStr
        });
        
        const energyAtStartOfDay = yesterdayData?.currentPowerConsumption || 0;
        
        // Tạo document mới cho ngày mới
        const newData = await SprayMachineData.create({
            machineId,
            date: today,
            operatingTime: 0,
            pausedTime: 12,
            totalEnergyConsumed: 0,
            energyAtStartOfDay,
            currentPowerConsumption: energyAtStartOfDay,
            lastStatus: 0,
            lastStatusChangeTime: new Date()
        });
        
        console.log(`🌅 [Service] Reset data for ${machineId} on ${today}. EnergyAtStart: ${energyAtStartOfDay}`);
        
        return newData;
        
    } catch (error) {
        console.error(`❌ [Service] Error resetting data for ${machineId}:`, error);
        throw error;
    }
};

/**
 * Verify machine exists và có đúng type
 * @param {string} machineId 
 * @returns {Promise<Machine>}
 */
export const verifyMachine = async (machineId) => {
    const machine = await Machine.findOne({ 
        machineId, 
        type: 'Spray Machine' 
    });
    
    if (!machine) {
        throw new Error(`Spray Machine ${machineId} not found`);
    }
    
    return machine;
};

/**
 * Update machine connection status
 * @param {string} machineId 
 * @param {boolean} isConnected 
 */
export const updateMachineConnectionStatus = async (machineId, isConnected) => {
    await Machine.findOneAndUpdate(
        { machineId },
        { 
            isConnected,
            lastHeartbeat: new Date(),
            status: isConnected ? 'online' : 'offline'
        }
    );
    
    console.log(`🔌 [Service] Machine ${machineId} connection: ${isConnected}`);
};