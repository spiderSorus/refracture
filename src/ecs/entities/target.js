import { Position, Renderable, Rotation, EntityType, ZLayer } from '../components/index';

export const createTarget = (x, y, type = 'A') => {
    // Determine configuration based on type
    const config = {
        'A': { color: 0x0000ff, type: 'rect' },
        'B': { color: 0x00ff00, type: 'rect' },
        'C': { color: 0xffff00, type: 'circle' }
    }[type] || { color: 0xffffff, type: 'rect' };

    return [
        Position(x, y),
        Rotation(0),
        ZLayer('PLAY', 0),
        Renderable({
            'BASE': {
                type: config.type,
                color: config.color,
                width: 12, height: 12, radius: 6 // Default sizes
            }
        }),
        EntityType(type)
    ];
};