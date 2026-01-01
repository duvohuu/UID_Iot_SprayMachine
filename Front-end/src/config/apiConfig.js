/**
 * ========================================
 * API URL CONFIGURATION - AUTO DETECT
 * ========================================
 * Tự động phát hiện môi trường:
 * - Development: localhost → localhost:5000
 * - Production: Vercel → Backend URL từ VITE_API_URL
 */

const getApiUrl = () => {
    // Priority 1: Environment variable (Production)
    if (import.meta.env.VITE_API_URL) {
        console.log('🔗 [API Config] Using VITE_API_URL:', import.meta.env.VITE_API_URL);
        return import.meta.env.VITE_API_URL;
    }
    
    // Priority 2: Auto-detect based on hostname (Development)
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        const devUrl = `${protocol}//${hostname}:5000`;
        console.log('🔗 [API Config] Development mode:', devUrl);
        return devUrl;
    }
    
    // Production fallback
    console.warn('⚠️ [API Config] No VITE_API_URL set, using same domain');
    return `${protocol}//${hostname}`;
};

export const API_URL = getApiUrl();

/**
 * Helper: Get full avatar URL
 */
export const getAvatarUrl = (avatar) => {
    if (!avatar) return undefined;
    if (avatar.startsWith('http')) return avatar;
    return `${API_URL}${avatar}`;
};

// Log for debugging
console.log('🌐 [API Config] Final API_URL:', API_URL);
console.log('🌐 [API Config] Current hostname:', window.location.hostname);
console.log('🌐 [API Config] Environment:', import.meta.env.MODE);