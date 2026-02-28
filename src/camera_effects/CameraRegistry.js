/**
 * Camera Registry
 * Centralized definitions for standard cameras used across backgrounds and scenes.
 */

export const CAMERA_TEMPLATES = {
    'watercolor': { 
        name: 'Watercolor Camera', 
        layer: 'bg_watercolor', 
        effect: 'watercolor', 
        type: 'BACKGROUND', 
        includeUI: true 
    },
    'stainedGlass': { 
        name: 'Stained Glass Camera', 
        layer: 'bg_watercolor', 
        effect: 'stainedGlass', 
        type: 'BACKGROUND', 
        includeUI: true 
    },
    'detail': { 
        name: 'Detail Camera', 
        layer: 'bg_glass', 
        effect: 'old_glass', 
        type: 'BACKGROUND', 
        includeUI: true 
    },
    'grayscale': { 
        name: 'ForegroundBW', 
        layer: 'fg_grayscale', 
        effect: 'grayscale', 
        type: 'PLAY' 
    },
    'ui': { 
        name: 'UICamera', 
        layer: 'uiLayer', 
        type: 'UI' 
    },
    'rainbow_web': {
        name: 'WebRainbow', 
        layer: 'web_rainbow', 
        effect: 'rainbow', 
        type: 'PLAY'
    },
    'lsd': {
        name: 'LsdCamera',
        layer: 'platform_layer',
        effect: 'lsd',
        type: 'PLAY'
    },
    'player': {
        name: 'PlayerCamera', 
        layer: 'player_layer', 
        type: 'PLAY'
    }
};

/**
 * Resolves a list of camera names or partial configs into full camera configurations.
 * @param {Array<string|Object>} list 
 * @returns {Array<Object>}
 */
export const resolveCameras = (list = []) => {
    return list.map(item => {
        if (typeof item === 'string') {
            return CAMERA_TEMPLATES[item] || null;
        }
        return item;
    }).filter(c => c !== null);
};
