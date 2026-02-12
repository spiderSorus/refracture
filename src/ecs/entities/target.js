import { Position, Graphic, Rotation, EntityType } from '../components/index';

/**
 * Standard Target Factory
 * @param {number} x 
 * @param {number} y 
 * @param {string} type - 'A', 'B', or 'C'
 */
export const createTarget = (x, y, type = 'A') => {
    // Determine color/shape based on type
    const config = {
        'A': { color: 0x0000ff, texture: 'rect' },
        'B': { color: 0x00ff00, texture: 'rect' },
        'C': { color: 0xffff00, texture: 'circle' }
    }[type] || { color: 0xffffff, texture: 'rect' };

    return [
        Position(x, y),
        Rotation(0), // Allows targets to face a direction if they move later
        Graphic(config.texture, config.color),
        EntityType(type)
    ];
};