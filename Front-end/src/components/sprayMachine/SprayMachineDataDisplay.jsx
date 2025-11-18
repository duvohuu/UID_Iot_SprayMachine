import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Alert, CircularProgress } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {
    DAILY_DATA_CONFIG,
    STATISTICS_CONFIG,
    formatValue,
    getPieChartData,
    pieChartOptions
} from '../../config/sprayMachineConfig';

ChartJS.register(ArcElement, Tooltip, Legend);

const SprayMachineDataDisplay = ({ dailyData, statistics, loading, error }) => {

    const StatCard = ({ config, value }) => {
        const Icon = config.icon;
        return (
            <Box sx={{ 
                p: 2.5, 
                borderRadius: 2, 
                border: '2px solid',
                borderColor: config.color,
                bgcolor: 'background.paper',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon sx={{ fontSize: 24, color: config.color }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {config.title}
                    </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: config.color }}>
                    {formatValue(value, config.unit)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    {config.description}
                </Typography>
            </Box>
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        📊 Phân bổ thời gian hôm nay
                    </Typography>

                    {dailyData?.operatingTime !== undefined && dailyData?.pausedTime !== undefined ? (
                        <Box>
                            <Box sx={{ height: 300, mb: 3 }}>
                                <Pie 
                                    data={getPieChartData(dailyData.operatingTime, dailyData.pausedTime)} 
                                    options={pieChartOptions} 
                                />
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Box sx={{ 
                                        p: 2, 
                                        borderRadius: 2, 
                                        bgcolor: '#4caf50',
                                        color: 'white',
                                        textAlign: 'center'
                                    }}>
                                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                            Thời gian chạy
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                                            {formatValue(dailyData.operatingTime, 'giờ')}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontSize: 11 }}>
                                            {((dailyData.operatingTime / 12) * 100).toFixed(1)}% ca
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={6}>
                                    <Box sx={{ 
                                        p: 2, 
                                        borderRadius: 2, 
                                        bgcolor: '#ff9800',
                                        color: 'white',
                                        textAlign: 'center'
                                    }}>
                                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                            Thời gian dừng
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                                            {formatValue(dailyData.pausedTime, 'giờ')}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontSize: 11 }}>
                                            {((dailyData.pausedTime / 12) * 100).toFixed(1)}% ca
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <Alert severity="info">Chưa có dữ liệu thời gian hôm nay</Alert>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        📈 Năng suất hôm nay
                    </Typography>

                    {dailyData ? (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <StatCard 
                                    config={DAILY_DATA_CONFIG.avgCurrent}
                                    value={dailyData.avgCurrent || dailyData.current}
                                />
                            </Grid>
                        </Grid>
                    ) : (
                        <Alert severity="info">Chưa có dữ liệu năng suất hôm nay</Alert>
                    )}

                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="caption">
                            💡 Dữ liệu tự động reset mỗi ngày lúc 6h sáng. Ca làm việc: 6h-18h (12 giờ).
                        </Typography>
                    </Alert>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        📅 Thống kê 30 ngày gần nhất
                    </Typography>

                    {statistics ? (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard 
                                    config={STATISTICS_CONFIG.totalOperatingTime}
                                    value={statistics.totalOperatingTime}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard 
                                    config={STATISTICS_CONFIG.totalEnergyConsumed}
                                    value={statistics.totalEnergyConsumed}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard 
                                    config={STATISTICS_CONFIG.averageOperatingPercentage}
                                    value={statistics.averageOperatingPercentage}
                                />
                            </Grid>
                        </Grid>
                    ) : (
                        <Alert severity="info">Chưa có dữ liệu thống kê 30 ngày</Alert>
                    )}
                </CardContent>
            </Card>

        </Box>
    );
};

export default SprayMachineDataDisplay;
