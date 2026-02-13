import { verifyMachine, updateMachineConnectionStatus } from '../services/machineService.js';
import { processMQTTUpdate } from '../services/sprayMachineService.js';
import mqttSocketEmitter from './mqttSocketEmitter.js';
import mqttTimeoutManager from './mqttTimeoutManager.js';
import { MACHINE_STATUS, LOG_PREFIX } from '../shared/constant/mqtt.constant.js';

/**
 * ========================================
 * MQTT MESSAGE HANDLER
 * ========================================
 * Processes incoming MQTT messages and triggers appropriate actions
 */

class MQTTMessageHandler {
    /**
     * Process incoming MQTT message
     */
    async processMessage(topic, messageBuffer) {
        try {
            // Parse JSON message
            const data = this.parseMessage(messageBuffer);
            
            // Validate message structure
            this.validateMessage(data);
            
            // Process business logic
            await this.handleMachineData(data);
            
        } catch (error) {
            console.error(`❌ ${LOG_PREFIX.MQTT} Message handler error:`, error.message);
            console.error('   Raw message:', messageBuffer.toString());
        }
    }

    /**
     * Parse message buffer to JSON
     */
    parseMessage(messageBuffer) {
        try {
            return JSON.parse(messageBuffer.toString());
        } catch (error) {
            throw new Error(`Failed to parse JSON: ${error.message}`);
        }
    }

    /**
     * Validate message structure
     */
    validateMessage(data) {
        const { machineId, status, powerConsumption } = data;
        
        if (!machineId) {
            throw new Error('Missing machineId in message');
        }
        
        if (status === undefined || status === null) {
            throw new Error('Missing status in message');
        }
        
        if (powerConsumption === undefined || powerConsumption === null) {
            throw new Error('Missing powerConsumption in message');
        }
        
        return true;
    }

    /**
     * Handle machine data update
     */
    async handleMachineData(data) {
        const { machineId, status, powerConsumption } = data;

        try {
            // Verify machine exists
            await verifyMachine(machineId);

            // Determine machine status
            const machineStatus = status === 1 ? MACHINE_STATUS.ONLINE : MACHINE_STATUS.OFFLINE;

            // Process MQTT update in database
            const updatedData = await processMQTTUpdate(machineId, {
                status,
                powerConsumption
            });

            // Update machine connection status
            const updatedMachine = await updateMachineConnectionStatus(
                machineId, 
                true,
                machineStatus
            );

            // If no shift exists, only update machine status
            if (!updatedData) {
                console.log(`⏰ ${LOG_PREFIX.MQTT} No shift exists for ${machineId} - message ignored`);
                mqttSocketEmitter.emitMachineStatus(
                    machineId,
                    machineStatus,
                    true,
                    { lastUpdate: new Date() }
                );
                mqttTimeoutManager.resetTimeout(machineId);
                return;
            }

            // Emit socket events for realtime updates
            mqttSocketEmitter.emitRealtimeUpdate(machineId, updatedMachine, updatedData);
            mqttSocketEmitter.emitSprayRealtime(updatedData);

            // Reset timeout (heartbeat received)
            mqttTimeoutManager.resetTimeout(machineId);

        } catch (error) {
            console.error(`❌ ${LOG_PREFIX.MQTT} Error processing message for ${machineId}:`, error);
            throw error;
        }
    }
}

export default new MQTTMessageHandler();