/**
 * ========================================
 * MQTT CONFIGURATION CONSTANTS
 * ========================================
 */

export const MQTT_CONFIG = {
    // Broker settings
    BROKER: 'mqtt://broker.hivemq.com',
    PORT: 1883,
    TOPIC: 'NgocHiepIOT/data',
    
    // Connection settings
    RECONNECT_PERIOD: 5000,
    CONNECT_TIMEOUT: 30000,
    CLEAN_SESSION: true,
    
    // Timeout settings
    MACHINE_TIMEOUT_MS: 30000,          // 30 seconds
    ERROR_UPDATE_INTERVAL_MS: 30000,    // 30 seconds
    ERROR_TRACKING_RESTORE_DELAY: 2000, // 2 seconds
    
    // QoS
    QOS: {
        AT_MOST_ONCE: 0,
        AT_LEAST_ONCE: 1,
        EXACTLY_ONCE: 2
    }
};

/**
 * Generate unique client ID
 */
export const generateClientId = () => {
    return `spray_backend_${Math.random().toString(16).substr(2, 8)}`;
};

/**
 * Machine status constants
 */
export const MACHINE_STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    ERROR: 'error'
};

/**
 * Notification types for MQTT events
 */
export const MQTT_NOTIFICATION_TYPES = {
    DISCONNECTED: 'mqtt_disconnected',
    RECONNECTED: 'mqtt_reconnected',
    ERROR: 'mqtt_error'
};

/**
 * Socket event names
 */
export const SOCKET_EVENTS = {
    SPRAY_REALTIME: 'spray:realtime',
    SPRAY_REALTIME_UPDATE: 'spray:realtime-update',
    MACHINE_STATUS_UPDATE: 'machine:status-update',
    NOTIFICATION_NEW: 'notification:new'
};

/**
 * Log prefixes
 */
export const LOG_PREFIX = {
    MQTT: '[MQTT]',
    SOCKET: '[Socket]',
    TIMEOUT: '[Timeout]'
};