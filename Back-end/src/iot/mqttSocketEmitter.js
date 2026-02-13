import { getIO } from '../config/socket.js';
import { SOCKET_EVENTS, LOG_PREFIX } from '../shared/constant/mqtt.constant.js';

/**
 * ========================================
 * MQTT SOCKET EMITTER
 * ========================================
 * Handles all Socket.IO event emissions for MQTT data
 */

class MQTTSocketEmitter {
    /**
     * Emit realtime spray data
     */
    emitSprayRealtime(updatedData) {
        try {
            const io = getIO();
            
            const realtimeData = {
                machineId: updatedData.machineId,
                date: updatedData.date,
                status: updatedData.lastStatus,
                activeTime: parseFloat(updatedData.activeTime.toFixed(2)),
                stopTime: parseFloat(updatedData.stopTime.toFixed(2)),
                errorTime: parseFloat(updatedData.errorTime.toFixed(2)),
                totalEnergyConsumed: parseFloat(updatedData.totalEnergyConsumed.toFixed(3)),
                powerConsumption: parseFloat(updatedData.currentPowerConsumption?.toFixed(3) || 0),
                efficiency: updatedData.efficiency,
                lastUpdate: updatedData.lastUpdate
            };

            // Broadcast to all clients
            io.emit(SOCKET_EVENTS.SPRAY_REALTIME, realtimeData);
            
            // Emit to specific machine room
            io.to(`machine-${updatedData.machineId}`).emit(
                SOCKET_EVENTS.SPRAY_REALTIME, 
                realtimeData
            );

            console.log(`${LOG_PREFIX.SOCKET} Emitted spray data for ${updatedData.machineId}`);
            
            return realtimeData;
        } catch (error) {
            console.error(`${LOG_PREFIX.SOCKET} Error emitting spray data:`, error.message);
            throw error;
        }
    }

    /**
     * Emit machine status update
     */
    emitMachineStatus(machineId, status, isConnected, additionalData = {}) {
        try {
            const io = getIO();
            
            const statusUpdate = {
                machineId,
                status,
                isConnected,
                lastHeartbeat: new Date(),
                ...additionalData
            };

            // Broadcast to all clients
            io.emit(SOCKET_EVENTS.MACHINE_STATUS_UPDATE, statusUpdate);
            
            // Emit to specific machine room
            io.to(`machine-${machineId}`).emit(
                SOCKET_EVENTS.MACHINE_STATUS_UPDATE, 
                statusUpdate
            );

            console.log(`${LOG_PREFIX.SOCKET} Emitted status for ${machineId}: ${status}`);
            
            return statusUpdate;
        } catch (error) {
            console.error(`${LOG_PREFIX.SOCKET} Error emitting status:`, error.message);
            throw error;
        }
    }

    /**
     * Emit realtime update with combined data
     */
    emitRealtimeUpdate(machineId, updatedMachine, updatedData) {
        try {
            const io = getIO();
            
            const updateEvent = {
                machineId,
                status: updatedMachine.status,
                isConnected: true,
                lastUpdate: updatedData.lastUpdate,
                data: {
                    activeTime: updatedData.activeTime,
                    stopTime: updatedData.stopTime,
                    errorTime: updatedData.errorTime,
                    totalEnergyConsumed: updatedData.totalEnergyConsumed,
                    efficiency: updatedData.efficiency
                }
            };

            io.to(`machine-${machineId}`).emit(
                SOCKET_EVENTS.SPRAY_REALTIME_UPDATE, 
                updateEvent
            );
            
            io.emit(SOCKET_EVENTS.MACHINE_STATUS_UPDATE, updateEvent);

            return updateEvent;
        } catch (error) {
            console.error(`${LOG_PREFIX.SOCKET} Error emitting realtime update:`, error.message);
            throw error;
        }
    }

    /**
     * Emit disconnect event
     */
    emitDisconnectEvent(machineId, updatedMachine, message = 'MQTT timeout') {
        try {
            const io = getIO();
            
            const disconnectEvent = {
                machineId,
                status: updatedMachine.status,
                isConnected: false,
                lastHeartbeat: updatedMachine.lastHeartbeat,
                lastUpdate: new Date(),
                message
            };

            io.emit(SOCKET_EVENTS.MACHINE_STATUS_UPDATE, disconnectEvent);
            io.to(`machine-${machineId}`).emit(
                SOCKET_EVENTS.MACHINE_STATUS_UPDATE, 
                disconnectEvent
            );

            console.log(`${LOG_PREFIX.SOCKET} Emitted disconnect for ${machineId}`);
            
            return disconnectEvent;
        } catch (error) {
            console.error(`${LOG_PREFIX.SOCKET} Error emitting disconnect:`, error.message);
            throw error;
        }
    }
}

export default new MQTTSocketEmitter();