import { useState, useEffect } from 'react';
import { getMachineByMachineId } from '../api/machineAPI';

export const useMachine = (machineId) => {
    const [machine, setMachine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMachine = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log(`🔍 Fetching machine details for machineId: ${machineId}`);
                
                const result = await getMachineByMachineId(machineId);
                
                if (result.success && result.data) {
                    setMachine(result.data);
                    console.log(`✅ Machine found:`, result.data.name);
                } else {
                    setError(result.message || 'Không tìm thấy máy');
                    setMachine(null);
                    console.error(`❌ Failed to load machine:`, result.message);
                }
            } catch (err) {
                setError('Lỗi khi tải thông tin máy');
                setMachine(null);
                console.error('❌ Error fetching machine:', err);
            } finally {
                setLoading(false);
            }
        };

        if (machineId) {
            fetchMachine();
        } else {
            setError('Machine ID không hợp lệ');
            setLoading(false);
        }
    }, [machineId]);

    return { machine, loading, error };
};