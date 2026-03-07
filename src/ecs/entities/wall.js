import {
    Position, Rotation, Renderable, Collider,
    StaticTag, WallTag, ZLayer, Mass, EntityType
} from '../components/index';

/**
 * Creates a wall entity defined by a center, width, height and rotation.
 * The edge is highlighted with a white glow.
 */
export const createWall = (x, y, width, height, rotation = 0, config = {}) => {
    const color = config.color || 0x333333;
    const glowColor = 0xffffff;
    const glowWidth = 4;

    return [
        Position(x, y),
        Rotation(rotation),
        ZLayer('PLAY', 0),
        WallTag(),
        EntityType('WALL'),
        Mass(1000), // Very heavy
        StaticTag(),
        Renderable({
            'BASE': {
                type: 'rect',
                width,
                height,
                color,
                alpha: 1.0,
                depth: 0
            },
            'GLOW': {
                type: 'rect',
                width: width + glowWidth,
                height: height + glowWidth,
                color: glowColor,
                alpha: 0.5,
                depth: -1, // Behind the base
                strokeColor: glowColor,
                strokeWidth: 2,
                strokeAlpha: 1.0
            }
        }),
        Collider('rect', 0, width, height)
    ];
};
