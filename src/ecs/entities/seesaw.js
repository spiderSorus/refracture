import {
    Position, Velocity, Rotation, Renderable, Collider,
    PlatformTag, EntityType, Mass, ZLayer, SeesawTag,
    AngularVelocity, GravityExempt, AnchorTag
} from '../components/index';

/**
 * Creates a Seesaw entity.
 * A platform that is fixed in space but can rotate around its center.
 */
export const createSeesaw = (x, y, config = {}) => {
    const width = config.width || 900;
    const height = config.height || 100;
    const color = config.color || 0xaa8844; // Wood-ish color
    
    const stiffness = config.stiffness ?? 0;
    const maxRotation = config.maxRotation ?? 0.8;

    return [
        Position(x, y),
        Velocity(0, 0),
        AngularVelocity(0),
        Rotation(0),
        ZLayer('PLAY', 0),
        PlatformTag(),
        AnchorTag(),
        SeesawTag(stiffness, maxRotation),
        GravityExempt(), // Doesn't fall, fixed at (x,y)
        EntityType('SEESAW'),
        Mass(config.mass || 20),
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
