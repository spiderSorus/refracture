import {
    Position, Velocity, Rotation, Renderable, Collider,
    PlatformTag, SpawnTag, EntityType, Mass, ZLayer, StaticTag,
    AngularVelocity
} from '../components/index';

/**
 * Creates a generic platform.
 */
export const createPlatform = (x, y, config = {}) => {
    const width = config.width || 100;
    const height = config.height || 100;
    const color = config.color || 0x888888;
    const isStatic = config.isStatic ?? true;
    const isCircle = config.shape === 'circle';

    const components = [
        Position(x, y),
        Velocity(0, 0),
        AngularVelocity(0),
        Rotation(0),
        ZLayer('PLAY', 0),
        PlatformTag(),
        EntityType('PLATFORM'),
        Mass(config.mass || 10),
        Renderable({
            'BASE': { 
                type: isCircle ? 'circle' : 'rect', 
                width, height, radius: width/2, color, 
                alpha: 1.0,
                depth: config.depth !== undefined ? config.depth : 0 
            }
        }),
        Collider(isCircle ? 'circle' : 'rect', width/2, width, height)
    ];

    if (isStatic) {
        components.push(StaticTag());
    }

    return components;
};

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
        AngularVelocity(0),
        Rotation(0),
        ZLayer('PLAY', 0),
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
