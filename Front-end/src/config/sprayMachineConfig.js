import {
    Timer as TimerIcon,
    WaterDrop as FlowIcon,
    Inventory as ProductIcon,
    BatteryChargingFull as EnergyIcon
} from '@mui/icons-material';

/**
 * ========================================
 * SIMPLIFIED SPRAY MACHINE CONFIG
 * ========================================
 * Chỉ hiển thị:
 * 1. Thời gian chạy/dừng (6h-18h) - Biểu đồ tròn
 * 2. Năng suất hôm nay (realtime, reset 6h sáng)
 * 3. Thống kê 30 ngày (năng lượng + % chạy)
 */

/**
 * Config cho dữ liệu hôm nay
 */
export const DAILY_DATA_CONFIG = {
    operatingTime: {
        title: 'Thời gian chạy',
        icon: TimerIcon,
        unit: 'giờ',
        color: '#4caf50',
        description: 'Tổng thời gian máy chạy trong ca (6h-18h)'
    },
    pausedTime: {
        title: 'Thời gian dừng',
        icon: TimerIcon,
        unit: 'giờ',
        color: '#ff9800',
        description: 'Tổng thời gian máy dừng trong ca'
    },
    avgCurrent: {
        title: 'Dòng điện TB',
        icon: EnergyIcon,
        unit: 'A',
        color: '#f44336',
        description: 'Cường độ dòng điện trung bình'
    }
};

/**
 * Config cho thống kê 30 ngày
 */
export const STATISTICS_CONFIG = {
    totalOperatingTime: {
        title: 'Tổng giờ chạy',
        icon: TimerIcon,
        unit: 'giờ',
        color: '#4caf50',
        description: 'Tổng thời gian chạy trong 30 ngày'
    },
    totalEnergyConsumed: {
        title: 'Tổng năng lượng',
        icon: EnergyIcon,
        unit: 'kWh',
        color: '#f44336',
        description: 'Tổng năng lượng tiêu thụ trong 30 ngày (tính từ dòng điện)'
    },
    averageOperatingPercentage: {
        title: '% Thời gian chạy',
        icon: TimerIcon,
        unit: '%',
        color: '#2196f3',
        description: 'Phần trăm thời gian máy chạy (so với ca làm việc 6h-18h)'
    },
    totalProducts: {
        title: 'Tổng sản phẩm',
        icon: ProductIcon,
        unit: 'sản phẩm',
        color: '#9c27b0',
        description: 'Tổng số sản phẩm hoàn thành trong 30 ngày'
    }
};

/**
 * ========================================
 * STATUS VALUES MAPPING
 * ========================================
 */
export const STATUS_VALUES = {
    SPRAY_STATUS: {
        0: { label: 'Dừng', color: 'error', icon: '🔴' },
        1: { label: 'Đang chạy', color: 'success', icon: '🟢' },
        2: { label: 'Chờ', color: 'warning', icon: '🟡' }
    },
    ERROR_CODE: {
        0: { label: 'Không có lỗi', color: 'success', icon: '✅' },
        1: { label: 'Lỗi áp suất', color: 'error', icon: '⚠️' },
        2: { label: 'Lỗi nhiệt độ', color: 'error', icon: '🌡️' },
        3: { label: 'Hết sơn', color: 'warning', icon: '🪣' },
        4: { label: 'Lỗi cảm biến', color: 'error', icon: '🔧' }
    }
};

/**
 * ========================================
 * HELPER FUNCTIONS
 * ========================================
 */

/**
 * Get status info from status value
 */
export const getStatusInfo = (type, value) => {
    const statusMap = STATUS_VALUES[type];
    if (!statusMap) {
        return { label: 'Unknown', color: 'default', icon: '❓' };
    }
    return statusMap[value] || { label: 'Unknown', color: 'default', icon: '❓' };
};

/**
 * Format số với đơn vị
 */
export const formatValue = (value, unit) => {
    if (value === null || value === undefined) return 'N/A';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'N/A';
    
    // Format số với 1 chữ số thập phân
    let formatted = numValue.toFixed(1);
    
    // Loại bỏ số 0 thừa (.0 → '')
    if (formatted.endsWith('.0')) {
        formatted = formatted.slice(0, -2);
    }
    
    return `${formatted}${unit ? ' ' + unit : ''}`;
};

/**
 * Calculate idle time (12h - chạy - dừng)
 */
export const calculateIdleTime = (operatingTime, pausedTime) => {
    const WORK_SHIFT = 12; // 6h-18h = 12 giờ
    const operating = parseFloat(operatingTime) || 0;
    const paused = parseFloat(pausedTime) || 0;
    const idle = WORK_SHIFT - operating - paused;
    
    return Math.max(0, idle);
};

/**
 * Get pie chart data - CHỈ 2 PHẦN: Chạy + Dừng
 * (Thời gian chờ được tính vào thời gian dừng)
 */
export const getPieChartData = (operatingTime, pausedTime) => {
    const operating = parseFloat(operatingTime) || 0;
    const paused = parseFloat(pausedTime) || 0;
    
    return {
        labels: ['Thời gian chạy', 'Thời gian dừng'],
        datasets: [{
            data: [operating, paused],
            backgroundColor: [
                '#4caf50',  // Green - Running
                '#ff9800'   // Orange - Paused/Stopped
            ],
            borderColor: '#ffffff',
            borderWidth: 2
        }]
    };
};

/**
 * Pie chart options
 */
export const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                padding: 15,
                font: {
                    size: 13,
                    weight: '500'
                }
            }
        },
        tooltip: {
            callbacks: {
                label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const percentage = ((value / 12) * 100).toFixed(1);
                    return `${label}: ${value.toFixed(1)}h (${percentage}%)`;
                }
            }
        }
    }
};

/**
 * ========================================
 * EXPORT DEFAULT
 * ========================================
 */
export default {
    DAILY_DATA_CONFIG,
    STATISTICS_CONFIG,
    STATUS_VALUES,
    formatValue,
    getStatusInfo,
    calculateIdleTime,
    getPieChartData,
    pieChartOptions
};