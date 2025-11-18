import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const MachineBasicInfo = ({ machine }) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Thông tin cơ bản
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography>
                        <strong>Loại máy:</strong> {machine.type}
                    </Typography>
                    <Typography>
                        <strong>Chủ sở hữu:</strong> {machine.userId}
                    </Typography>
                    <Typography>
                        <strong>ID:</strong> {machine.machineId}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default MachineBasicInfo;