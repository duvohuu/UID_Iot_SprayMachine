import { useState, useEffect, useCallback, useRef } from 'react';
import { 
    getSprayRealtimeData, 
    getSprayDailyData, 
    getSpray30DaysHistory,
    getSprayStatistics,
    getSprayPieChartData
} from '../api/sprayMachineAPI';

/**
 * ========================================
 * CUSTOM HOOK: useSprayRealtime
 * ========================================
 * Hook quản lý dữ liệu realtime và historical của Spray Machine
 * 
 * @param {string} machineId - ID của máy Spray
 * @returns {Object} State và functions để quản lý dữ liệu Spray
 */
export const useSprayRealtime = (machineId) => {
    // ==================== STATE ====================
    const [realtimeData, setRealtimeData] = useState(null);
    const [dailyData, setDailyData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [pieChartData, setPieChartData] = useState(null);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Refs for cleanup
    const realtimeIntervalRef = useRef(null);
    const dailyIntervalRef = useRef(null);
    const isMountedRef = useRef(true);

    // ==================== FETCH FUNCTIONS ====================
    
    /**
     * Fetch dữ liệu realtime (được gọi mỗi 5s)
     */
    const fetchRealtimeData = useCallback(async () => {
        if (!machineId || !isMountedRef.current) return;

        try {
            const result = await getSprayRealtimeData(machineId);
            
            if (result.success && isMountedRef.current) {
                setRealtimeData(result.data);
                setError(null);
                
                console.log('✅ [Spray Realtime] Updated:', {
                    machineId,
                    status: result.data.sprayStatus,
                    pressure: result.data.pressure,
                    timestamp: new Date().toLocaleTimeString()
                });
            } else if (!result.success && isMountedRef.current) {
                setError(result.message);
                console.error('❌ [Spray Realtime] Error:', result.message);
            }
        } catch (err) {
            if (isMountedRef.current) {
                setError('Lỗi khi lấy dữ liệu realtime');
                console.error('❌ [Spray Realtime] Exception:', err);
            }
        }
    }, [machineId]);

    /**
     * Fetch dữ liệu hôm nay (được gọi mỗi 30s)
     */
    const fetchDailyData = useCallback(async () => {
        if (!machineId || !isMountedRef.current) return;

        try {
            const result = await getSprayDailyData(machineId);
            
            if (result.success && isMountedRef.current) {
                setDailyData(result.data);
                
                console.log('✅ [Spray Daily] Updated:', {
                    machineId,
                    operatingTime: result.data.operatingTime,
                    productCount: result.data.productCount,
                    date: result.data.date
                });
            }
        } catch (err) {
            console.error('❌ [Spray Daily] Exception:', err);
        }
    }, [machineId]);

    /**
     * Fetch dữ liệu 30 ngày
     */
    const fetchHistoryData = useCallback(async () => {
        if (!machineId || !isMountedRef.current) return;

        try {
            const result = await getSpray30DaysHistory(machineId, { limit: 30 });
            
            if (result.success && isMountedRef.current) {
                setHistoryData(result.data);
                
                console.log('✅ [Spray History] Loaded:', {
                    machineId,
                    dataPoints: result.data.length,
                    dateRange: result.data.length > 0 ? {
                        from: result.data[result.data.length - 1]?.date,
                        to: result.data[0]?.date
                    } : null
                });
            }
        } catch (err) {
            console.error('❌ [Spray History] Exception:', err);
        }
    }, [machineId]);

    /**
     * Fetch thống kê tổng hợp
     */
    const fetchStatistics = useCallback(async () => {
        if (!machineId || !isMountedRef.current) return;

        try {
            const result = await getSprayStatistics(machineId);
            
            if (result.success && isMountedRef.current) {
                setStatistics(result.data);
                
                console.log('✅ [Spray Statistics] Loaded:', {
                    machineId,
                    totalOperatingTime: result.data.totalOperatingTime,
                    averageEfficiency: result.data.averageEfficiency
                });
            }
        } catch (err) {
            console.error('❌ [Spray Statistics] Exception:', err);
        }
    }, [machineId]);

    /**
     * Fetch dữ liệu biểu đồ tròn
     */
    const fetchPieChartData = useCallback(async () => {
        if (!machineId || !isMountedRef.current) return;

        try {
            const result = await getSprayPieChartData(machineId);
            
            if (result.success && isMountedRef.current) {
                setPieChartData(result.data);
                
                console.log('✅ [Spray Pie Chart] Loaded:', {
                    machineId,
                    operatingTime: result.data.operatingTime,
                    pausedTime: result.data.pausedTime,
                    idleTime: result.data.idleTime
                });
            }
        } catch (err) {
            console.error('❌ [Spray Pie Chart] Exception:', err);
        }
    }, [machineId]);

    // ==================== INITIAL FETCH ====================
    
    /**
     * Load tất cả dữ liệu lần đầu
     */
    const loadAllData = useCallback(async () => {
        if (!machineId) {
            setLoading(false);
            return;
        }

        console.log('🔄 [Spray] Loading all data for:', machineId);
        setLoading(true);
        setError(null);

        try {
            // Fetch tất cả dữ liệu song song
            await Promise.all([
                fetchRealtimeData(),
                fetchDailyData(),
                fetchHistoryData(),
                fetchStatistics(),
                fetchPieChartData()
            ]);
        } catch (err) {
            console.error('❌ [Spray] Error loading data:', err);
            if (isMountedRef.current) {
                setError('Lỗi khi tải dữ liệu Spray Machine');
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [machineId, fetchRealtimeData, fetchDailyData, fetchHistoryData, fetchStatistics, fetchPieChartData]);

    // ==================== REFRESH FUNCTION ====================
    
    /**
     * Làm mới tất cả dữ liệu (manual refresh)
     */
    const refreshAllData = useCallback(async () => {
        if (isRefreshing) return;
        
        console.log('🔄 [Spray] Manual refresh triggered');
        setIsRefreshing(true);

        try {
            await Promise.all([
                fetchRealtimeData(),
                fetchDailyData(),
                fetchPieChartData()
            ]);
        } catch (err) {
            console.error('❌ [Spray] Refresh error:', err);
        } finally {
            setIsRefreshing(false);
        }
    }, [isRefreshing, fetchRealtimeData, fetchDailyData, fetchPieChartData]);

    /**
     * Làm mới chỉ dữ liệu historical (ít thay đổi)
     */
    const refreshHistoricalData = useCallback(async () => {
        console.log('🔄 [Spray] Refreshing historical data');
        
        try {
            await Promise.all([
                fetchHistoryData(),
                fetchStatistics()
            ]);
        } catch (err) {
            console.error('❌ [Spray] Historical refresh error:', err);
        }
    }, [fetchHistoryData, fetchStatistics]);

    // ==================== EFFECTS ====================
    
    /**
     * Initial load khi component mount hoặc machineId thay đổi
     */
    useEffect(() => {
        isMountedRef.current = true;
        loadAllData();

        return () => {
            isMountedRef.current = false;
        };
    }, [loadAllData]);

    /**
     * Auto-refresh realtime data mỗi 5 giây
     */
    useEffect(() => {
        if (!machineId) return;

        console.log('⏰ [Spray] Starting realtime auto-refresh (5s interval)');
        
        realtimeIntervalRef.current = setInterval(() => {
            if (isMountedRef.current) {
                fetchRealtimeData();
            }
        }, 5000);

        return () => {
            if (realtimeIntervalRef.current) {
                clearInterval(realtimeIntervalRef.current);
                console.log('🛑 [Spray] Stopped realtime auto-refresh');
            }
        };
    }, [machineId, fetchRealtimeData]);

    /**
     * Auto-refresh daily data và pie chart mỗi 30 giây
     */
    useEffect(() => {
        if (!machineId) return;

        console.log('⏰ [Spray] Starting daily data auto-refresh (30s interval)');
        
        dailyIntervalRef.current = setInterval(() => {
            if (isMountedRef.current) {
                fetchDailyData();
                fetchPieChartData();
            }
        }, 30000);

        return () => {
            if (dailyIntervalRef.current) {
                clearInterval(dailyIntervalRef.current);
                console.log('🛑 [Spray] Stopped daily data auto-refresh');
            }
        };
    }, [machineId, fetchDailyData, fetchPieChartData]);

    // ==================== COMPUTED VALUES ====================
    
    /**
     * Check xem có dữ liệu hay không
     */
    const hasData = realtimeData !== null || dailyData !== null;

    /**
     * Get trạng thái kết nối hiện tại
     */
    const isConnected = realtimeData?.isConnected ?? false;

    /**
     * Get trạng thái phun hiện tại
     */
    const currentSprayStatus = realtimeData?.sprayStatus ?? 0;

    /**
     * Tính % hiệu suất hôm nay
     */
    const todayEfficiency = dailyData ? 
        ((dailyData.operatingTime / 12) * 100).toFixed(1) : 0;

    // ==================== RETURN ====================
    
    return {
        // Data
        realtimeData,
        dailyData,
        historyData,
        statistics,
        pieChartData,
        
        // States
        loading,
        error,
        isRefreshing,
        
        // Computed
        hasData,
        isConnected,
        currentSprayStatus,
        todayEfficiency,
        
        // Functions
        refreshAllData,
        refreshHistoricalData,
        fetchRealtimeData,
        fetchDailyData,
    };
};

export default useSprayRealtime;