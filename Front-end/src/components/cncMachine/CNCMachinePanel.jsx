import React, { useState, useEffect } from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    Button, 
    Chip, 
    Divider,
    Grid,
    LinearProgress,
    Alert
} from '@mui/material';
import { 
    Wifi as WifiIcon,
    WifiOff as WifiOffIcon,
    Refresh as RefreshIcon,
    Settings as SettingsIcon,
    Build as CNCIcon
} from '@mui/icons-material';
import { useCNCRealtime } from '../../hooks/useCNCRealtime';

const CNCMachinePanel = ({ machine, machineRealtime, isConnected, user }) => {
    const [timeRange, setTimeRange] = useState('1h');
    const {
        realtimeData,
        loading,
        error,
        refreshData
    } = useCNCRealtime(machine?.machineId, timeRange);

    const getStatusInfo = (status) => {
        switch (status) {
            case 0:
                return { label: 'Đèn đỏ', color: 'error', icon: '🔴', description: 'Chưa hoạt động' };
            case 1:
                return { label: 'Đèn vàng', color: 'warning', icon: '🟡', description: 'Hoạt động không tải' };
            case 2:
                return { label: 'Đèn xanh', color: 'success', icon: '🟢', description: 'Hoạt động có tải' };
            default:
                return { label: 'Không xác định', color: 'default', icon: '⚫', description: 'Trạng thái không rõ' };
        }
    };

    const getCurrentInfo = () => {
        if (!realtimeData?.currentData) {
            return {
                timeStamp: 'N/A',
                status: 0,
                workingCurrent: 0,
                totalCurrent: 0
            };
        }
        return realtimeData.currentData;
    };

    const getStatistics = () => {
        return {
            totalOperatingHours: realtimeData?.statistics?.totalOperatingHours || 0,
            efficiency: realtimeData?.statistics?.efficiency || 0,
            averageWorkingCurrent: realtimeData?.statistics?.averageWorkingCurrent || 0,
            averageTotalCurrent: realtimeData?.statistics?.averageTotalCurrent || 0,
            totalDataPoints: realtimeData?.statistics?.totalDataPoints || 0
        };
    };

    const currentInfo = getCurrentInfo();
    const statusInfo = getStatusInfo(currentInfo.status);
    const stats = getStatistics();

    const StatItem = ({ label, value, unit, progress, color = 'primary' }) => (
        <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {typeof value === 'number' ? value.toFixed(3) : value} {unit}
            </Typography>
            {progress !== undefined && (
                <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                    color={color}
                />
            )}
        </Box>
    );

    return (
        <Box>
            {/* Trạng thái kết nối */}
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        🔗 Kết nối CNC
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        {isConnected ? (
                            <WifiIcon sx={{ color: 'success.main' }} />
                        ) : (
                            <WifiOffIcon sx={{ color: 'error.main' }} />
                        )}
                        <Chip
                            label={isConnected ? 'Đã kết nối' : 'Mất kết nối'}
                            color={isConnected ? 'success' : 'error'}
                            variant="filled"
                            size="small"
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            Machine ID
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                            {machine.machineId}
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            Địa chỉ IP
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                            {machine.ip}
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            Giao thức
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            MQTT Protocol
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={refreshData}
                            disabled={loading}
                            sx={{ flex: 1 }}
                        >
                            Làm mới
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<SettingsIcon />}
                            disabled={!isConnected}
                            sx={{ flex: 1 }}
                        >
                            Kiểm tra
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Dữ liệu hiện tại */}
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        📊 Dữ liệu hiện tại
                    </Typography>

                    {error ? (
                        <Typography variant="body2" color="error">
                            Lỗi: {error}
                        </Typography>
                    ) : (
                        <Box>
                            {/* Trạng thái */}
                            <Box sx={{ mb: 2, textAlign: 'center' }}>
                                <Box sx={{ fontSize: '2rem', mb: 1 }}>{statusInfo.icon}</Box>
                                <Chip 
                                    label={statusInfo.label}
                                    color={statusInfo.color}
                                    size="small"
                                />
                                <Typography variant="caption" display="block" color="text.secondary">
                                    {statusInfo.description}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Dòng điện */}
                            <StatItem 
                                label="⚡ Dòng hoạt động"
                                value={currentInfo.workingCurrent}
                                unit="A"
                                progress={Math.min((currentInfo.workingCurrent / 10) * 100, 100)}
                                color="primary"
                            />

                            <StatItem 
                                label="🔋 Tổng dòng điện"
                                value={currentInfo.totalCurrent}
                                unit="A"
                                progress={Math.min((currentInfo.totalCurrent / 20) * 100, 100)}
                                color="secondary"
                            />

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="caption" color="text.secondary">
                                🕒 Cập nhật: {currentInfo.timeStamp}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Thống kê */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        📈 Thống kê
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <StatItem 
                                label="Thời gian hoạt động"
                                value={stats.totalOperatingHours}
                                unit="h"
                                color="success"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <StatItem 
                                label="Hiệu suất"
                                value={stats.efficiency}
                                unit="%"
                                progress={stats.efficiency}
                                color="success"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <StatItem 
                                label="TB dòng hoạt động"
                                value={stats.averageWorkingCurrent}
                                unit="A"
                                color="info"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <StatItem 
                                label="TB tổng dòng"
                                value={stats.averageTotalCurrent}
                                unit="A"
                                color="info"
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="caption" color="text.secondary">
                        📊 Tổng điểm dữ liệu: {stats.totalDataPoints}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CNCMachinePanel;