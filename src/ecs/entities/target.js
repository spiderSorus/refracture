import { Position, Renderable, Rotation, EntityType, ZLayer, TargetTag, Collider } from '../components/index';

export const createTarget = (x, y, width = 50, height = 50) => {
    return [
        Position(x, y),
        Rotation(0),
        ZLayer('PLAY', 0),
        TargetTag(false),
        Collider('rect', 0, width, height),
        Renderable({
            'OFF': {
                type: 'rect',
                color: 0xff0000, // Red
                width: width, height: height,
                alpha: 0.5
            }
        }),
        EntityType('TARGET')
    ];
};