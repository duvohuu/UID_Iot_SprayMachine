import React from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    Chip, 
    Divider,
    LinearProgress,
    Alert,
    Button,
    CircularProgress
} from '@mui/material';
import { 
    Wifi as WifiIcon,
    WifiOff as WifiOffIcon,
    Refresh as RefreshIcon,
    Settings as SettingsIcon,
    Opacity as SprayIcon,
    Speed as PressureIcon,
    Thermostat as TempIcon,
    WaterDrop as FlowIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { getStatusInfo } from '../../config/sprayMachineConfig';

/**
 * ========================================
 * SPRAY MACHINE PANEL COMPONENT
 * ========================================
 * Panel bên trái hiển thị:
 * - Trạng thái kết nối
 * - Thông tin máy
 * - Dữ liệu realtime hiện tại
 * - Các actions (Refresh, Settings)
 */
const SprayMachinePanel = ({ 
    machine,
    realtimeData,
    isConnected,
    loading,
    error,
    onRefresh
}) => {

    // ==================== HELPER FUNCTIONS ====================
    
    /**
     * Get màu sắc cho status chip
     */
    const getStatusColor = (status) => {
        const info = getStatusInfo('SPRAY_STATUS', status);
        return info.color;
    };

    /**
     * Get icon cho status
     */
    const getStatusIcon = (status) => {
        const info = getStatusInfo('SPRAY_STATUS', status);
        return info.icon;
    };

    /**
     * Get label cho status
     */
    const getStatusLabel = (status) => {
        const info = getStatusInfo('SPRAY_STATUS', status);
        return info.label;
    };

    /**
     * Get thông tin error
     */
    const getErrorInfo = (errorCode) => {
        const info = getStatusInfo('ERROR_CODE', errorCode);
        return info;
    };

    /**
     * Component hiển thị 1 stat item với progress bar
     */
    const StatItem = ({ label, value, unit, icon: Icon, progress, color = 'primary', max }) => (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {Icon && <Icon sx={{ fontSize: 18, color: `${color}.main` }} />}
                <Typography variant="caption" color="text.secondary">
                    {label}
                </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {typeof value === 'number' ? value.toFixed(2) : value} {unit}
            </Typography>
            {progress !== undefined && (
                <>
                    <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                        color={color}
                    />
                    {max && (
                        <Typography variant="caption" color="text.secondary">
                            Max: {max} {unit}
                        </Typography>
                    )}
                </>
            )}
        </Box>
    );

    // ==================== RENDER ====================

    return (
        <Box>
            {/* ========== CARD 1: TRẠNG THÁI KẾT NỐI ========== */}
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        🔗 Kết nối Spray Machine
                    </Typography>
                    
                    {/* Connection Status */}
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

                    {/* Machine ID */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            Machine ID
                        </Typography>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontFamily: 'monospace', 
                                fontWeight: 'bold',
                                color: 'primary.main'
                            }}
                        >
                            {machine?.machineId || 'N/A'}
                        </Typography>
                    </Box>

                    {/* Machine Name */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            Tên máy
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {machine?.name || 'N/A'}
                        </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={onRefresh}
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

            {/* ========== CARD 2: TRẠNG THÁI HIỆN TẠI ========== */}
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        📊 Trạng thái hiện tại
                    </Typography>

                    {error ? (
                        <Alert severity="error">{error}</Alert>
                    ) : loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={40} />
                        </Box>
                    ) : realtimeData ? (
                        <Box>
                            {/* Spray Status */}
                            <Box sx={{ mb: 3, textAlign: 'center' }}>
                                <Box sx={{ fontSize: '3rem', mb: 1 }}>
                                    {getStatusIcon(realtimeData.sprayStatus)}
                                </Box>
                                <Chip 
                                    icon={<SprayIcon />}
                                    label={getStatusLabel(realtimeData.sprayStatus)}
                                    color={getStatusColor(realtimeData.sprayStatus)}
                                    sx={{ fontWeight: 600, px: 2 }}
                                />
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                                    Trạng thái phun sơn
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Pressure */}
                            <StatItem 
                                label="Áp suất phun"
                                value={realtimeData.pressure}
                                unit="bar"
                                icon={PressureIcon}
                                progress={Math.min((realtimeData.pressure / 10) * 100, 100)}
                                color="info"
                                max={10}
                            />

                            {/* Temperature */}
                            <StatItem 
                                label="Nhiệt độ môi trường"
                                value={realtimeData.temperature}
                                unit="°C"
                                icon={TempIcon}
                                progress={Math.min((realtimeData.temperature / 35) * 100, 100)}
                                color="warning"
                                max={35}
                            />

                            {/* Flow Rate */}
                            <StatItem 
                                label="Lưu lượng sơn"
                                value={realtimeData.flowRate}
                                unit="ml/min"
                                icon={FlowIcon}
                                progress={Math.min((realtimeData.flowRate / 1000) * 100, 100)}
                                color="primary"
                                max={1000}
                            />

                            <Divider sx={{ my: 2 }} />

                            {/* Error Status */}
                            {realtimeData.errorCode !== 0 && (
                                <Alert 
                                    severity="error" 
                                    icon={<ErrorIcon />}
                                    sx={{ mb: 2 }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {getErrorInfo(realtimeData.errorCode).icon} {getErrorInfo(realtimeData.errorCode).label}
                                    </Typography>
                                </Alert>
                            )}

                            {/* Last Update */}
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ textAlign: 'center' }}>
                                Cập nhật: {realtimeData.lastUpdate 
                                    ? new Date(realtimeData.lastUpdate).toLocaleTimeString('vi-VN')
                                    : 'N/A'}
                            </Typography>
                        </Box>
                    ) : (
                        <Alert severity="info">
                            Chưa có dữ liệu realtime
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* ========== CARD 3: THÔNG TIN THÊM ========== */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        ℹ️ Thông tin thêm
                    </Typography>

                    {realtimeData && (
                        <Box>
                            {/* Operator */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Người vận hành
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {realtimeData.operatorName || 'Chưa cập nhật'}
                                </Typography>
                            </Box>

                            {/* Paint Used Today */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Sơn đã dùng hôm nay
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {realtimeData.totalPaintUsed?.toFixed(2) || '0.00'} lít
                                </Typography>
                            </Box>

                            {/* Products Today */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Sản phẩm đã phun hôm nay
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {realtimeData.productCount || 0} sản phẩm
                                </Typography>
                            </Box>

                            {/* Operating Time Today */}
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Thời gian hoạt động hôm nay
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {realtimeData.operatingTime?.toFixed(1) || '0.0'} giờ
                                </Typography>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={Math.min((realtimeData.operatingTime / 12) * 100, 100)}
                                    sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                                    color="success"
                                />
                                <Typography variant="caption" color="text.secondary">
                                    / 12 giờ (6h-18h)
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default SprayMachinePanel;