import React from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    Grid, 
    Chip, 
    LinearProgress,
    Alert,
    CircularProgress 
} from '@mui/material';
import { 
    Timeline as TimelineIcon,
    TrendingUp,
    ElectricBolt,
    AccessTime
} from '@mui/icons-material';

const CNCStatistics = ({ realtimeData, historyData, loading, error }) => {
    // Map status number to readable format
    const getStatusInfo = (status) => {
        switch (status) {
            case 0:
                return { label: 'Đèn đỏ', color: 'error', icon: '🔴' };
            case 1:
                return { label: 'Đèn vàng', color: 'warning', icon: '🟡' };
            case 2:
                return { label: 'Đèn xanh', color: 'success', icon: '🟢' };
            default:
                return { label: 'Không xác định', color: 'default', icon: '⚫' };
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
        if (!historyData || historyData.length === 0) {
            return {
                avgWorkingCurrent: 0,
                avgTotalCurrent: 0,
                maxWorkingCurrent: 0,
                maxTotalCurrent: 0,
                activeTime: 0,
                dataPoints: 0
            };
        }

        const workingCurrents = historyData.map(d => d.workingCurrent || 0);
        const totalCurrents = historyData.map(d => d.totalCurrent || 0);
        const activeCount = historyData.filter(d => d.status === 2).length;

        return {
            avgWorkingCurrent: workingCurrents.reduce((a, b) => a + b, 0) / workingCurrents.length,
            avgTotalCurrent: totalCurrents.reduce((a, b) => a + b, 0) / totalCurrents.length,
            maxWorkingCurrent: Math.max(...workingCurrents),
            maxTotalCurrent: Math.max(...totalCurrents),
            activeTime: ((activeCount / historyData.length) * 100),
            dataPoints: historyData.length
        };
    };

    const currentInfo = getCurrentInfo();
    const statusInfo = getStatusInfo(currentInfo.status);
    const stats = getStatistics();

    const StatCard = ({ title, value, unit, icon, color, description }) => {
        return (
            <Box sx={{ 
                p: 2, 
                border: 1, 
                borderColor: 'divider', 
                borderRadius: 1,
                textAlign: 'center',
                height: '100%'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <Box sx={{ fontSize: '1.2rem', mr: 1 }}>{icon}</Box>
                    <Typography variant="caption" color="text.secondary">
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h6" sx={{ color, fontWeight: 'bold', mb: 1 }}>
                    {typeof value === 'number' ? value.toFixed(3) : value}{unit}
                </Typography>
                {description && (
                    <Typography variant="caption" color="text.secondary">
                        {description}
                    </Typography>
                )}
            </Box>
        );
    };

    if (loading) {
        return (
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={30} />
                        <Typography sx={{ ml: 2 }}>Đang tải thống kê...</Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent>
                    <Alert severity="error">
                        <Typography variant="body2">
                            Lỗi tải thống kê: {error}
                        </Typography>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TimelineIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Thống kê CNC
                    </Typography>
                    <Chip 
                        label={`${stats.dataPoints} điểm dữ liệu`}
                        size="small"
                        variant="outlined"
                    />
                </Box>

                {/* Dữ liệu hiện tại */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        📊 Dữ liệu hiện tại
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <StatCard 
                                title="Trạng thái"
                                value={statusInfo.label}
                                unit=""
                                icon={statusInfo.icon}
                                color={`${statusInfo.color}.main`}
                                description="Hiện tại"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <StatCard 
                                title="Dòng hoạt động"
                                value={currentInfo.workingCurrent}
                                unit="A"
                                icon="⚡"
                                color="primary.main"
                                description="Hiện tại"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <StatCard 
                                title="Tổng dòng điện"
                                value={currentInfo.totalCurrent}
                                unit="A"
                                icon="🔋"
                                color="secondary.main"
                                description="Hiện tại"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <StatCard 
                                title="Thời gian hoạt động"
                                value={stats.activeTime}
                                unit="%"
                                icon="⏱️"
                                color="success.main"
                                description="Tỷ lệ đèn xanh"
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* Thống kê trung bình */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        📈 Thống kê trung bình
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Dòng hoạt động trung bình
                                </Typography>
                                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                                    {stats.avgWorkingCurrent.toFixed(3)}A
                                </Typography>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={(stats.avgWorkingCurrent / Math.max(stats.maxWorkingCurrent, 1)) * 100} 
                                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Tổng dòng điện trung bình
                                </Typography>
                                <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 'bold' }}>
                                    {stats.avgTotalCurrent.toFixed(3)}A
                                </Typography>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={(stats.avgTotalCurrent / Math.max(stats.maxTotalCurrent, 1)) * 100} 
                                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                    color="secondary"
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Thống kê tối đa */}
                <Box>
                    <Typography variant="subtitle2" gutterBottom>
                        🔥 Giá trị tối đa
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                                Dòng hoạt động cao nhất
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {stats.maxWorkingCurrent.toFixed(3)}A
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                                Tổng dòng điện cao nhất
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {stats.maxTotalCurrent.toFixed(3)}A
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Cập nhật cuối */}
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                        🕒 Cập nhật lần cuối: {currentInfo.timeStamp}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CNCStatistics;