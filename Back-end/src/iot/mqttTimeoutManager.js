import Machine from '../models/Machine.model.js';
import { updateMachineConnectionStatus } from '../services/machineService.js';
import { processErrorTimeout, getSprayTodayData } from '../services/sprayMachineService.js';
import { createAndBroadcastNotification } from '../services/notificationService.js';
import mqttSocketEmitter from './mqttSocketEmitter.js';
import { 
    MQTT_CONFIG, 
    MACHINE_STATUS, 
    MQTT_NOTIFICATION_TYPES,
    LOG_PREFIX 
} from '../shared/constant/mqtt.constant.js';

/**
 * ========================================
 * MQTT TIMEOUT MANAGER
 * ========================================
 * Manages machine timeouts and error tracking intervals
 */

class MQTTTimeoutManager {
    constructor() {
        this.machineTimeouts = new Map();
        this.machineErrorIntervals = new Map();
    }

    /**
     * Reset timeout for a machine
     * Called when machine sends data (heartbeat)
     */
    resetTimeout(machineId) {
        // Clear existing timeout
        this.clearTimeout(machineId);
        
        // Clear error interval if running
        this.stopErrorTracking(machineId);

        // Set new timeout
        const timeoutId = setTimeout(
            () => this.handleTimeout(machineId), 
            MQTT_CONFIG.MACHINE_TIMEOUT_MS
        );

        this.machineTimeouts.set(machineId, timeoutId);
    }

    /**
     * Clear timeout for a machine
     */
    clearTimeout(machineId) {
        if (this.machineTimeouts.has(machineId)) {
            clearTimeout(this.machineTimeouts.get(machineId));
            this.machineTimeouts.delete(machineId);
        }
    }

    /**
     * Handle timeout event (no data received)
     */
    async handleTimeout(machineId) {
        console.log(`⏱️ ${LOG_PREFIX.TIMEOUT} Timeout for ${machineId} - No message in ${MQTT_CONFIG.MACHINE_TIMEOUT_MS/1000}s`);
        
        try {
            // Update machine status to error
            const updatedMachine = await updateMachineConnectionStatus(
                machineId, 
                false, 
                MACHINE_STATUS.ERROR
            );
            
            // Process error timeout (update spray data)
            const updatedData = await processErrorTimeout(machineId);
            
            // Emit disconnect event
            mqttSocketEmitter.emitDisconnectEvent(
                machineId,
                updatedMachine,
                `MQTT timeout - No data received in ${MQTT_CONFIG.MACHINE_TIMEOUT_MS/1000}s`
            );
            
            // Emit error data if available
            if (updatedData) {
                mqttSocketEmitter.emitSprayRealtime(updatedData);
            }
            
            // Start tracking error time
            this.startErrorTracking(machineId);
            
            // Send notification
            await this.sendTimeoutNotification(machineId, updatedMachine);
            
        } catch (error) {
            console.error(`❌ ${LOG_PREFIX.TIMEOUT} Timeout handler error for ${machineId}:`, error);
        }
    }

    /**
     * Start error tracking interval
     */
    startErrorTracking(machineId) {
        console.log(`🔴 ${LOG_PREFIX.MQTT} Starting error tracking for ${machineId}`);
        
        // Stop any existing tracking
        this.stopErrorTracking(machineId);
        
        // Process immediately
        this.processErrorUpdate(machineId);
        
        // Start interval
        const intervalId = setInterval(
            () => this.processErrorUpdate(machineId),
            MQTT_CONFIG.ERROR_UPDATE_INTERVAL_MS
        );
        
        this.machineErrorIntervals.set(machineId, intervalId);
        console.log(`▶️ ${LOG_PREFIX.MQTT} Error interval started for ${machineId}`);
    }

    /**
     * Stop error tracking interval
     */
    stopErrorTracking(machineId) {
        if (this.machineErrorIntervals.has(machineId)) {
            clearInterval(this.machineErrorIntervals.get(machineId));
            this.machineErrorIntervals.delete(machineId);
            console.log(`⏹️ ${LOG_PREFIX.MQTT} Stopped error interval for ${machineId}`);
        }
    }

    /**
     * Process error update (increment error time)
     */
    async processErrorUpdate(machineId) {
        try {
            console.log(`🔄 ${LOG_PREFIX.MQTT} Updating errorTime for ${machineId}`);
            
            const updatedErrorData = await processErrorTimeout(machineId);
            
            if (updatedErrorData) {
                mqttSocketEmitter.emitSprayRealtime(updatedErrorData);
            }
        } catch (error) {
            console.error(`❌ ${LOG_PREFIX.MQTT} Error updating errorTime for ${machineId}:`, error);
        }
    }

    /**
     * Send timeout notification
     */
    async sendTimeoutNotification(machineId, updatedMachine) {
        try {
            const machine = await Machine.findOne({ machineId });
            
            if (machine) {
                await createAndBroadcastNotification({
                    userId: machine.userId,
                    machineId: machine.machineId,
                    machineName: machine.name,
                    type: MQTT_NOTIFICATION_TYPES.DISCONNECTED,
                    severity: 'error',
                    title: 'Mất kết nối MQTT',
                    message: `Máy ${machine.name} không phản hồi trong ${MQTT_CONFIG.MACHINE_TIMEOUT_MS/1000} giây. Kiểm tra kết nối mạng.`,
                    metadata: {
                        lastHeartbeat: updatedMachine.lastHeartbeat,
                        timeoutDuration: `${MQTT_CONFIG.MACHINE_TIMEOUT_MS/1000}s`
                    }
                });
            }
        } catch (error) {
            console.error(`❌ ${LOG_PREFIX.MQTT} Notification Error:`, error);
        }
    }

    /**
     * Initialize timeouts for all connected machines
     */
    async initializeTimeouts() {
        try {
            console.log(`⏱️ ${LOG_PREFIX.MQTT} Initializing timeouts for connected machines...`);
            
            const connectedMachines = await Machine.find({ 
                type: 'Spray Machine', 
                isConnected: true 
            });
            
            console.log(`📊 ${LOG_PREFIX.MQTT} Found ${connectedMachines.length} connected Spray Machines`);
            
            for (const machine of connectedMachines) {
                this.resetTimeout(machine.machineId);
                console.log(`⏱️ ${LOG_PREFIX.MQTT} Timeout initialized for ${machine.machineId}`);
            }
            
            console.log(`✅ ${LOG_PREFIX.MQTT} Timeouts initialized for all connected machines`);
        } catch (error) {
            console.error(`❌ ${LOG_PREFIX.MQTT} Error initializing timeouts:`, error);
        }
    }

    /**
     * Restore error tracking for machines in error state
     */
    async restoreErrorTracking() {
        try {
            console.log(`🔄 ${LOG_PREFIX.MQTT} Restoring error tracking for machines...`);
            
            const errorMachines = await Machine.find({ 
                status: MACHINE_STATUS.ERROR,
                type: 'Spray Machine'
            });
            
            console.log(`📊 ${LOG_PREFIX.MQTT} Found ${errorMachines.length} machines in error state`);
            
            for (const machine of errorMachines) {
                const todayData = await getSprayTodayData(machine.machineId);
                
                // Only restore if there's data for today and lastStatus is -1 (error)
                if (todayData && todayData.lastStatus === -1) {
                    console.log(`🔴 ${LOG_PREFIX.MQTT} Restoring error tracking for ${machine.machineId}`);
                    this.startErrorTracking(machine.machineId);
                }
            }
            
            console.log(`✅ ${LOG_PREFIX.MQTT} Error tracking restoration completed`);
        } catch (error) {
            console.error(`❌ ${LOG_PREFIX.MQTT} Error restoring error tracking:`, error);
        }
    }

    /**
     * Clear all timeouts and intervals
     */
    clearAll() {
        // Clear all timeouts
        for (const [machineId, timeoutId] of this.machineTimeouts.entries()) {
            clearTimeout(timeoutId);
        }
        this.machineTimeouts.clear();

        // Clear all intervals
        for (const [machineId, intervalId] of this.machineErrorIntervals.entries()) {
            clearInterval(intervalId);
        }
        this.machineErrorIntervals.clear();
        
        console.log(`🧹 ${LOG_PREFIX.MQTT} All timeouts and intervals cleared`);
    }
}

export default new MQTTTimeoutManager();