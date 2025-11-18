/**
 * ========================================
 * SPRAY MACHINE CONTROLLER
 * ========================================
 * Mock data controllers for testing UI
 */

/**
 * GET /api/spray-machine/realtime/:machineId
 * Lấy dữ liệu realtime của Spray Machine
 */
export const getSprayRealtimeData = async (req, res) => {
    try {
        const { machineId } = req.params;
        
        console.log(`📊 [Spray Realtime] Request for: ${machineId}`);

        // Mock realtime data
        const mockData = {
            machineId,
            machineName: 'Spray Machine 001',
            sprayStatus: Math.floor(Math.random() * 3), // 0: Dừng, 1: Phun, 2: Chuẩn bị
            pressure: parseFloat((Math.random() * 5 + 3).toFixed(2)), // 3-8 bar
            temperature: parseFloat((Math.random() * 10 + 20).toFixed(1)), // 20-30°C
            flowRate: parseInt((Math.random() * 500 + 500).toFixed(0)), // 500-1000 ml/min
            totalPaintUsed: parseFloat((Math.random() * 50 + 10).toFixed(2)), // 10-60 lít
            productCount: Math.floor(Math.random() * 100 + 50), // 50-150
            operatingTime: parseFloat((Math.random() * 8 + 2).toFixed(1)), // 2-10h
            pausedTime: parseFloat((Math.random() * 2).toFixed(1)), // 0-2h
            errorCode: Math.random() > 0.9 ? Math.floor(Math.random() * 4 + 1) : 0,
            operatorName: ['John Doe', 'Jane Smith', 'Mike Johnson'][Math.floor(Math.random() * 3)],
            isConnected: true,
            lastUpdate: new Date().toISOString()
        };

        res.json(mockData);
    } catch (error) {
        console.error('❌ [Spray Realtime] Error:', error);
        res.status(500).json({ 
            message: 'Error fetching spray realtime data', 
            error: error.message 
        });
    }
};

/**
 * GET /api/spray-machine/daily/:machineId
 * Lấy dữ liệu hàng ngày
 */
export const getSprayDailyData = async (req, res) => {
    try {
        const { machineId } = req.params;
        
        console.log(`📅 [Spray Daily] Request for: ${machineId}`);

        // Mock daily data
        const mockData = {
            date: new Date().toISOString().split('T')[0],
            operatingTime: parseFloat((Math.random() * 6 + 4).toFixed(1)), // 4-10h
            pausedTime: parseFloat((Math.random() * 2).toFixed(1)), // 0-2h
            totalPaintUsed: parseFloat((Math.random() * 40 + 10).toFixed(2)), // 10-50 lít
            productCount: Math.floor(Math.random() * 80 + 40), // 40-120
            energyConsumption: parseFloat((Math.random() * 30 + 10).toFixed(2)), // 10-40 kWh
            efficiency: parseFloat((Math.random() * 30 + 60).toFixed(1)) // 60-90%
        };

        res.json(mockData);
    } catch (error) {
        console.error('❌ [Spray Daily] Error:', error);
        res.status(500).json({ 
            message: 'Error fetching spray daily data', 
            error: error.message 
        });
    }
};

/**
 * GET /api/spray-machine/history/:machineId
 * Lấy lịch sử 30 ngày
 */
export const getSpray30DaysHistory = async (req, res) => {
    try {
        const { machineId } = req.params;
        const limit = parseInt(req.query.limit) || 30;
        
        console.log(`📜 [Spray History] Request for: ${machineId}, limit: ${limit}`);

        // Generate mock history
        const mockHistory = [];
        const today = new Date();
        
        for (let i = 0; i < limit; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            mockHistory.push({
                date: date.toISOString().split('T')[0],
                operatingTime: parseFloat((Math.random() * 6 + 4).toFixed(1)),
                pausedTime: parseFloat((Math.random() * 2).toFixed(1)),
                totalPaintUsed: parseFloat((Math.random() * 40 + 10).toFixed(2)),
                productCount: Math.floor(Math.random() * 80 + 40),
                energyConsumption: parseFloat((Math.random() * 30 + 10).toFixed(2)),
                efficiency: parseFloat((Math.random() * 30 + 60).toFixed(1))
            });
        }

        res.json(mockHistory);
    } catch (error) {
        console.error('❌ [Spray History] Error:', error);
        res.status(500).json({ 
            message: 'Error fetching spray history', 
            error: error.message 
        });
    }
};

/**
 * GET /api/spray-machine/statistics/:machineId
 * Lấy thống kê tổng hợp 30 ngày
 */
export const getSprayStatistics = async (req, res) => {
    try {
        const { machineId } = req.params;
        
        console.log(`📊 [Spray Statistics] Request for: ${machineId}`);

        // Mock statistics
        const mockStats = {
            totalOperatingTime: parseFloat((Math.random() * 100 + 100).toFixed(1)), // 100-200h
            totalPaintUsed: parseFloat((Math.random() * 500 + 300).toFixed(2)), // 300-800 lít
            totalProducts: Math.floor(Math.random() * 2000 + 1000), // 1000-3000
            averageEfficiency: parseFloat((Math.random() * 20 + 70).toFixed(1)), // 70-90%
            totalEnergyConsumption: parseFloat((Math.random() * 500 + 300).toFixed(2)) // 300-800 kWh
        };

        res.json(mockStats);
    } catch (error) {
        console.error('❌ [Spray Statistics] Error:', error);
        res.status(500).json({ 
            message: 'Error fetching spray statistics', 
            error: error.message 
        });
    }
};

/**
 * GET /api/spray-machine/pie-chart/:machineId
 * Lấy dữ liệu biểu đồ tròn
 */
export const getSprayPieChartData = async (req, res) => {
    try {
        const { machineId } = req.params;
        
        console.log(`🥧 [Spray Pie Chart] Request for: ${machineId}`);

        // Mock pie chart data
        const operatingTime = Math.random() * 6 + 4; // 4-10h
        const pausedTime = Math.random() * 2; // 0-2h
        const totalTime = 12; // Work shift: 6h-18h
        const idleTime = totalTime - operatingTime - pausedTime;

        const mockData = {
            operatingTime: parseFloat(operatingTime.toFixed(1)),
            pausedTime: parseFloat(pausedTime.toFixed(1)),
            idleTime: parseFloat(Math.max(0, idleTime).toFixed(1)),
            totalTime
        };

        res.json(mockData);
    } catch (error) {
        console.error('❌ [Spray Pie Chart] Error:', error);
        res.status(500).json({ 
            message: 'Error fetching spray pie chart data', 
            error: error.message 
        });
    }
};