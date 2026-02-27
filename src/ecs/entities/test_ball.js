import {
    Position, Velocity, Rotation, Renderable, Collider,
    PlatformTag, EntityType, Mass, ZLayer, AngularVelocity,
    Destructible, Ego
} from '../components/index';

/**
 * Creates a Test Ball entity.
 * A physical sphere that rolls and can be webbed/attached to.
 */
export const createTestBall = (x, y, config = {}) => {
    const radius = config.radius || 30;
    const color = config.color || 0xffaa00; // Orange

    return [
        Position(x, y),
        Velocity(0, 0),
        AngularVelocity(0),
        Rotation(0),
        ZLayer('PLAY', 0),
        PlatformTag(), // Treat as a platform for attachment/webbing
        EntityType('TEST_BALL'),
        Ego(50),
        Mass(config.mass || 5),
        Renderable({
            'BASE': { 
                type: 'circle', 
                radius, color, 
                alpha: 1.0,
                depth: 5
            }
        }),
        Collider('circle', radius),
        Destructible() // Can be destroyed if it falls out of bounds
    ];
};
