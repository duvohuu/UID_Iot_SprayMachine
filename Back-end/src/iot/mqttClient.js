import mqtt from 'mqtt';
import { MQTT_CONFIG, generateClientId, LOG_PREFIX } from '../shared/constant/mqtt.constant.js';
import mqttMessageHandler from './mqttMessageHandler.js';
import mqttTimeoutManager from './mqttTimeoutManager.js';

/**
 * ========================================
 * MQTT CLIENT FOR SPRAY MACHINE
 * ========================================
 * Core MQTT client connection and lifecycle management
 */

class MQTTClient {
    constructor() {
        this.client = null;
        this.clientId = generateClientId();
        this.isInitialized = false;
    }

    /**
     * Initialize MQTT Client
     */
    initialize() {
        if (this.isInitialized) {
            console.log(`${LOG_PREFIX.MQTT} Already initialized`);
            return this.client;
        }

        console.log(`${LOG_PREFIX.MQTT} Initializing MQTT Client...`);
        console.log(`   Broker: ${MQTT_CONFIG.BROKER}:${MQTT_CONFIG.PORT}`);
        console.log(`   Topic: ${MQTT_CONFIG.TOPIC}`);
        console.log(`   Client ID: ${this.clientId}`);

        this.client = mqtt.connect(MQTT_CONFIG.BROKER, {
            port: MQTT_CONFIG.PORT,
            clientId: this.clientId,
            clean: MQTT_CONFIG.CLEAN_SESSION,
            reconnectPeriod: MQTT_CONFIG.RECONNECT_PERIOD,
            connectTimeout: MQTT_CONFIG.CONNECT_TIMEOUT
        });

        this.setupEventHandlers();
        this.isInitialized = true;

        return this.client;
    }

    /**
     * Setup all MQTT event handlers
     */
    setupEventHandlers() {
        this.client.on('connect', () => this.onConnect());
        this.client.on('message', (topic, message) => this.onMessage(topic, message));
        this.client.on('error', (error) => this.onError(error));
        this.client.on('offline', () => this.onOffline());
        this.client.on('reconnect', () => this.onReconnect());
        this.client.on('close', () => this.onClose());
    }

    /**
     * Handle connection established
     */
    onConnect() {
        console.log(`✅ ${LOG_PREFIX.MQTT} Connected successfully`);
        
        this.client.subscribe(MQTT_CONFIG.TOPIC, (err) => {
            if (err) {
                console.error(`❌ ${LOG_PREFIX.MQTT} Subscribe Error:`, err);
            } else {
                console.log(`📡 ${LOG_PREFIX.MQTT} Subscribed to topic: ${MQTT_CONFIG.TOPIC}`);
                
                // Restore error tracking after connection
                setTimeout(() => {
                    mqttTimeoutManager.restoreErrorTracking();
                }, MQTT_CONFIG.ERROR_TRACKING_RESTORE_DELAY);
            }
        });
    }

    /**
     * Handle incoming message
     */
    async onMessage(topic, message) {
        await mqttMessageHandler.processMessage(topic, message);
    }

    /**
     * Handle connection error
     */
    onError(error) {
        console.error(`❌ ${LOG_PREFIX.MQTT} Connection Error:`, error.message);
    }

    /**
     * Handle offline event
     */
    onOffline() {
        console.log(`📴 ${LOG_PREFIX.MQTT} Client is offline`);
    }

    /**
     * Handle reconnection attempt
     */
    onReconnect() {
        console.log(`🔄 ${LOG_PREFIX.MQTT} Reconnecting...`);
    }

    /**
     * Handle connection close
     */
    onClose() {
        console.log(`🔌 ${LOG_PREFIX.MQTT} Connection closed`);
    }

    /**
     * Publish message to MQTT topic
     */
    publish(topic, message, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.client || !this.client.connected) {
                const error = new Error('MQTT Client not connected');
                console.error(`❌ ${LOG_PREFIX.MQTT}`, error.message);
                return reject(error);
            }

            const payload = typeof message === 'string' ? message : JSON.stringify(message);
            const publishOptions = {
                qos: options.qos || MQTT_CONFIG.QOS.AT_LEAST_ONCE,
                retain: options.retain || false
            };

            this.client.publish(topic, payload, publishOptions, (err) => {
                if (err) {
                    console.error(`❌ ${LOG_PREFIX.MQTT} Publish Error:`, err);
                    reject(err);
                } else {
                    console.log(`✅ ${LOG_PREFIX.MQTT} Published to ${topic}`);
                    resolve();
                }
            });
        });
    }

    /**
     * Get MQTT client status
     */
    getStatus() {
        return {
            connected: this.client?.connected || false,
            broker: MQTT_CONFIG.BROKER,
            port: MQTT_CONFIG.PORT,
            topic: MQTT_CONFIG.TOPIC,
            clientId: this.clientId,
            isInitialized: this.isInitialized
        };
    }

    /**
     * Disconnect MQTT client
     */
    disconnect() {
        if (this.client) {
            console.log(`🔌 ${LOG_PREFIX.MQTT} Disconnecting...`);
            
            // Clear all timeouts and intervals
            mqttTimeoutManager.clearAll();
            
            // End MQTT connection
            this.client.end(true);
            this.client = null;
            this.isInitialized = false;
            
            console.log(`✅ ${LOG_PREFIX.MQTT} Disconnected successfully`);
        }
    }

    /**
     * Get client instance
     */
    getClient() {
        return this.client;
    }
}

// Export singleton instance
const mqttClient = new MQTTClient();

// Export main functions
export const initializeMQTT = () => mqttClient.initialize();
export const publishMQTT = (topic, message, options) => mqttClient.publish(topic, message, options);
export const disconnectMQTT = () => mqttClient.disconnect();
export const getMQTTStatus = () => mqttClient.getStatus();
export const getMQTTClient = () => mqttClient.getClient();

// Export timeout manager functions
export const initializeTimeouts = () => mqttTimeoutManager.initializeTimeouts();
export const restoreErrorTracking = () => mqttTimeoutManager.restoreErrorTracking();
export const startErrorTracking = (machineId) => mqttTimeoutManager.startErrorTracking(machineId);

export default mqttClient;