import {
    Position, Velocity, Rotation, Renderable, Collider,
    PlatformTag, SpawnTag, EntityType, Mass
} from '../components/index';

/**
 * Creates a designated spawn platform.
 * Default: 100x100 green square.
 */
export const createSpawnPlatform = (x, y, config = {}) => {
    const width = config.width || 100;
    const height = config.height || 100;
    const color = config.color || 0x888888;

    return [
        Position(x, y),
        Velocity(0, 0),
        Rotation(0),
        PlatformTag(),
        SpawnTag(),
        EntityType('PLATFORM'),
        Mass(config.mass || 10),
        Renderable({
            'BASE': { 
                type: 'rect', 
                width, height, color, 
                alpha: 1.0,
                depth: config.depth !== undefined ? config.depth : 0 
            }
        }),
        Collider('rect', 0, width, height)
    ];
};
