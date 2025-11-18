import React, { useState, useEffect } from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    Button,
    Alert,
    ToggleButton,
    ToggleButtonGroup,
    Chip,
    LinearProgress
} from '@mui/material';
import { 
    Timeline as TimelineIcon,
    PlayArrow as PlayIcon,
    Pause as PauseIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useCNCRealtime } from '../../hooks/useCNCRealtime';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

const CNCMachineDataDisplay = ({ machine, machineRealtime, isConnected, user }) => {
    const [timeRange, setTimeRange] = useState('1h');
    const [isRecording, setIsRecording] = useState(true);
    const [realtimeChartData, setRealtimeChartData] = useState({
        workingCurrent: [],
        totalCurrent: [],
        status: []
    });

    const {
        realtimeData,
        historyData,
        loading,
        error,
        refreshData
    } = useCNCRealtime(machine?.machineId, timeRange);

    // Cập nhật data cho biểu đồ realtime
    useEffect(() => {
        if (!isRecording || !realtimeData?.currentData) return;

        const interval = setInterval(() => {
            const now = new Date();
            const currentData = realtimeData.currentData;

            setRealtimeChartData(prev => {
                const newData = {
                    workingCurrent: [...prev.workingCurrent, { x: now, y: currentData.workingCurrent }],
                    totalCurrent: [...prev.totalCurrent, { x: now, y: currentData.totalCurrent }],
                    status: [...prev.status, { x: now, y: currentData.status }]
                };

                // Giới hạn 100 điểm cho mỗi dataset
                Object.keys(newData).forEach(key => {
                    if (newData[key].length > 100) {
                        newData[key] = newData[key].slice(-100);
                    }
                });

                return newData;
            });
        }, 2000); // Cập nhật mỗi 2 giây

        return () => clearInterval(interval);
    }, [isRecording, realtimeData]);

    const handleTimeRangeChange = (event, newRange) => {
        if (newRange !== null) {
            setTimeRange(newRange);
        }
    };

    const toggleRecording = () => {
        setIsRecording(!isRecording);
    };

    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Dữ liệu CNC Realtime'
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    displayFormats: {
                        second: 'HH:mm:ss'
                    }
                },
                title: {
                    display: true,
                    text: 'Thời gian'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Giá trị'
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        }
    };

    // Chart data
    const chartData = {
        datasets: [
            {
                label: 'Dòng hoạt động (A)',
                data: realtimeChartData.workingCurrent,
                borderColor: 'rgb(25, 118, 210)',
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            },
            {
                label: 'Tổng dòng điện (A)',
                data: realtimeChartData.totalCurrent,
                borderColor: 'rgb(156, 39, 176)',
                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            },
            {
                label: 'Trạng thái',
                data: realtimeChartData.status,
                borderColor: 'rgb(76, 175, 80)',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1,
                yAxisID: 'y1'
            }
        ]
    };

    // Update chart options for dual y-axis
    const enhancedChartOptions = {
        ...chartOptions,
        scales: {
            ...chartOptions.scales,
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                min: 0,
                max: 3,
                title: {
                    display: true,
                    text: 'Trạng thái (0-2)'
                },
                grid: {
                    drawOnChartArea: false,
                }
            }
        }
    };

    if (loading && !realtimeData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <LinearProgress sx={{ width: '100%' }} />
                <Typography sx={{ ml: 2 }}>Đang tải dữ liệu CNC...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Biểu đồ Realtime */}
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TimelineIcon sx={{ color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Dữ liệu CNC Realtime - {machine?.name}
                            </Typography>
                            <Chip 
                                label={isRecording ? 'Đang ghi' : 'Đã dừng'}
                                color={isRecording ? 'success' : 'error'}
                                size="small"
                                icon={isRecording ? <PlayIcon /> : <PauseIcon />}
                            />
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <ToggleButtonGroup
                                value={timeRange}
                                exclusive
                                onChange={handleTimeRangeChange}
                                size="small"
                            >
                                <ToggleButton value="5m">5m</ToggleButton>
                                <ToggleButton value="15m">15m</ToggleButton>
                                <ToggleButton value="30m">30m</ToggleButton>
                                <ToggleButton value="1h">1h</ToggleButton>
                            </ToggleButtonGroup>
                            
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={isRecording ? <PauseIcon /> : <PlayIcon />}
                                onClick={toggleRecording}
                                color={isRecording ? 'warning' : 'success'}
                            >
                                {isRecording ? 'Dừng' : 'Bắt đầu'}
                            </Button>
                            
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<RefreshIcon />}
                                onClick={refreshData}
                            >
                                Làm mới
                            </Button>
                        </Box>
                    </Box>

                    {/* Thời gian cập nhật cuối */}
                    <Typography variant="caption" color="text.secondary">
                        Cập nhật lần cuối: {realtimeData?.currentData?.timeStamp || 'N/A'}
                    </Typography>

                    {/* Biểu đồ */}
                    <Box sx={{ height: 500, mt: 2 }}>
                        {realtimeChartData.workingCurrent.length > 0 ? (
                            <Line data={chartData} options={enhancedChartOptions} />
                        ) : (
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                height: '100%',
                                flexDirection: 'column',
                                gap: 2
                            }}>
                                <Typography variant="h6" color="text.secondary">
                                    {isRecording ? 'Đang chờ dữ liệu CNC...' : 'Biểu đồ đã dừng'}
                                </Typography>
                                <Typography variant="body2" color="text.disabled">
                                    {isRecording 
                                        ? 'Dữ liệu sẽ xuất hiện khi máy CNC gửi thông tin'
                                        : 'Bấm "Bắt đầu" để tiếp tục ghi dữ liệu'
                                    }
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {/* Cảnh báo kết nối */}
            {!isConnected && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    ⚠️ Mất kết nối với máy CNC. Dữ liệu có thể không được cập nhật.
                </Alert>
            )}

            {/* Hướng dẫn */}
            <Card>
                <CardContent>
                    <Alert severity="info">
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>📋 Hướng dẫn đọc dữ liệu CNC:</strong>
                        </Typography>
                        <Typography variant="body2" component="div">
                            • <strong>🔴 Đèn đỏ (0):</strong> Đầu công tác chưa hoạt động<br/>
                            • <strong>🟡 Đèn vàng (1):</strong> Đầu công tác hoạt động nhưng chưa có tải<br/>
                            • <strong>🟢 Đèn xanh (2):</strong> Đầu công tác hoạt động và có tải<br/>
                            • <strong>⚡ Dòng điện:</strong> Được đo bằng Ampere (A), cập nhật mỗi 2 giây
                        </Typography>
                    </Alert>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CNCMachineDataDisplay;