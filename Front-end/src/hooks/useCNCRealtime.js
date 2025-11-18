import { useState, useEffect, useCallback } from 'react';
import { getCNCRealtimeData, getCNCHistoryData } from '../api/cncMachineAPI';

export const useCNCRealtime = (machineId, timeRange = '1h') => {
    const [realtimeData, setRealtimeData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRecording, setIsRecording] = useState(true);

    // Fetch initial data and history
    const fetchData = useCallback(async () => {
        if (!machineId) return;

        try {
            setLoading(true);
            setError(null);

            // Fetch current realtime data
            const realtimeResult = await getCNCRealtimeData(machineId);
            if (realtimeResult.success) {
                setRealtimeData(realtimeResult.data);
            } else {
                setError(realtimeResult.message);
            }

            // Fetch history data
            const historyResult = await getCNCHistoryData(machineId, timeRange);
            if (historyResult.success) {
                setHistoryData(historyResult.data.historyData || []);
            }

        } catch (err) {
            setError('Lỗi khi tải dữ liệu CNC');
            console.error('Error fetching CNC data:', err);
        } finally {
            setLoading(false);
        }
    }, [machineId, timeRange]);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Auto refresh every 5 seconds when recording
    useEffect(() => {
        if (!isRecording || !machineId) return;

        const interval = setInterval(() => {
            fetchData();
        }, 5000);

        return () => clearInterval(interval);
    }, [isRecording, machineId, fetchData]);

    const toggleRecording = () => {
        setIsRecording(!isRecording);
    };

    const refreshData = () => {
        fetchData();
    };

    return {
        realtimeData,
        historyData,
        loading,
        error,
        isRecording,
        toggleRecording,
        refreshData
    };
};