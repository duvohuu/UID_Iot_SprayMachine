import axios from "axios";
import { API_URL } from '../config/apiConfig.js';

axios.defaults.withCredentials = true;


// Lấy dữ liệu realtime CNC
export const getCNCRealtimeData = async (machineId) => {
    try {
        const response = await axios.get(`${API_URL}/api/cnc-machine/realtime/${machineId}`, {
            withCredentials: true
        });
        return { success: true, data: response.data };
    } catch (err) {
        return { 
            success: false, 
            message: err.response?.data?.message || "Lỗi lấy dữ liệu realtime CNC" 
        };
    }
};

// Lấy lịch sử dữ liệu CNC
export const getCNCHistoryData = async (machineId, timeRange = '1h', limit = 100) => {
    try {
        const queryParams = new URLSearchParams({
            timeRange,
            limit: limit.toString()
        });

        const response = await axios.get(`${API_URL}/api/cnc-machine/history/${machineId}?${queryParams}`, {
            withCredentials: true
        });
        return { success: true, data: response.data };
    } catch (err) {
        return { 
            success: false, 
            message: err.response?.data?.message || "Lỗi lấy lịch sử dữ liệu CNC" 
        };
    }
};