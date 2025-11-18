import React from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    Button, 
    Chip,
    ToggleButton,
    ToggleButtonGroup,
    Alert,
    CircularProgress
} from '@mui/material';
import { 
    Timeline as TimelineIcon,
    Refresh as RefreshIcon,
    Pause as PauseIcon,
    PlayArrow as PlayIcon
} from '@mui/icons-material';

const CNCRealtimeChart = ({ 
    machine,
    realtimeData,
    historyData,
    loading,
    error,
    isRecording,
    toggleRecording,
    refreshData,
    timeRange,
    setTimeRange
}) => {
    const handleTimeRangeChange = (event, newRange) => {
        if (newRange !== null) {
            setTimeRange(newRange);
        }
    };

    const SimpleChart = ({ data, title, color, valueKey }) => {
        if (!data || data.length === 0) {
            return (
                <Box sx={{ mb: 2, textAlign: 'center', py: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>{title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Chưa có dữ liệu
                    </Typography>
                </Box>
            );
        }

        const values = data.map(d => d[valueKey] || 0);
        const maxValue = Math.max(...values, 1);
        const latestValue = values[values.length - 1] || 0;
        
        return (
            <Box sx={{ mb: 2 }}>
                <Typography variant="caption" gutterBottom display="block" sx={{ fontWeight: 'bold' }}>
                    {title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'end', height: 40, gap: 1, mb: 1 }}>
                    {values.slice(-15).map((value, index) => (
                        <Box
                            key={index}
                            sx={{
                                flex: 1,
                                backgroundColor: color,
                                height: `${(value / maxValue) * 100}%`,
                                minHeight: 2,
                                borderRadius: '1px',
                                opacity: 0.6 + (index / 15) * 0.4
                            }}
                        />
                    ))}
                </Box>
                <Typography variant="caption" color="text.secondary">
                    {latestValue.toFixed(3)} ({values.length} điểm)
                </Typography>
            </Box>
        );
    };

    if (loading) {
        return (
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={30} />
                        <Typography sx={{ ml: 2 }}>Đang tải biểu đồ...</Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TimelineIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                        Biểu đồ Realtime
                    </Typography>
                </Box>

                {/* Controls */}
                <Box sx={{ mb: 2 }}>
                    <ToggleButtonGroup
                        value={timeRange}
                        exclusive
                        onChange={handleTimeRangeChange}
                        size="small"
                        sx={{ mb: 1, display: 'flex' }}
                    >
                        <ToggleButton value="5m" sx={{ flex: 1, fontSize: '0.75rem' }}>5m</ToggleButton>
                        <ToggleButton value="15m" sx={{ flex: 1, fontSize: '0.75rem' }}>15m</ToggleButton>
                        <ToggleButton value="30m" sx={{ flex: 1, fontSize: '0.75rem' }}>30m</ToggleButton>
                        <ToggleButton value="1h" sx={{ flex: 1, fontSize: '0.75rem' }}>1h</ToggleButton>
                    </ToggleButtonGroup>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={isRecording ? <PauseIcon /> : <PlayIcon />}
                            onClick={toggleRecording}
                            color={isRecording ? 'warning' : 'success'}
                            sx={{ flex: 1, fontSize: '0.75rem' }}
                        >
                            {isRecording ? 'Dừng' : 'Bắt đầu'}
                        </Button>
                        
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={refreshData}
                            sx={{ flex: 1, fontSize: '0.75rem' }}
                        >
                            Làm mới
                        </Button>
                    </Box>
                </Box>

                {/* Status */}
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Chip 
                        label={isRecording ? 'Đang ghi' : 'Đã dừng'}
                        color={isRecording ? 'success' : 'error'}
                        size="small"
                        icon={isRecording ? <PlayIcon /> : <PauseIcon />}
                    />
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="caption">
                            Lỗi: {error}
                        </Typography>
                    </Alert>
                )}

                {/* Charts */}
                {historyData && historyData.length > 0 ? (
                    <Box>
                        <SimpleChart 
                            data={historyData}
                            title="🔴🟡🟢 Trạng thái"
                            color="rgb(25, 118, 210)"
                            valueKey="status"
                        />
                        <SimpleChart 
                            data={historyData}
                            title="⚡ Dòng hoạt động (A)"
                            color="rgb(76, 175, 80)"
                            valueKey="workingCurrent"
                        />
                        <SimpleChart 
                            data={historyData}
                            title="🔋 Tổng dòng điện (A)"
                            color="rgb(156, 39, 176)"
                            valueKey="totalCurrent"
                        />
                    </Box>
                ) : (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: 120,
                        flexDirection: 'column',
                        gap: 1
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            📊 Chưa có dữ liệu
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            {isRecording ? 'Đang chờ dữ liệu từ máy CNC' : 'Bấm "Bắt đầu" để ghi dữ liệu'}
                        </Typography>
                    </Box>
                )}

                {/* Info */}
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                        💡 Hiển thị 15 điểm gần nhất
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        📡 Cập nhật mỗi 5 giây
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CNCRealtimeChart;