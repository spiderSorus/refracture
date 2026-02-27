import {
    Position, Rotation, Renderable,
    BackgroundTag, EntityType, PlatformTag,
    Collider, Parallax, ZLayer
} from '../components/index';

/**
 * Creates a background shape entity.
 * These are visual-only but use the standard platform system for consistency.
 */
export const createBackgroundShape = (x, y, shapeType, config = {}) => {
    const layer = 'BASE';
    const depth = config.depth || 90;

    return [
        Position(x, y),
        Rotation(config.rotation || 0),
        ZLayer('BACKGROUND', config.zIndex || 0),
        BackgroundTag(),
        EntityType('BACKGROUND_SHAPE'),
        Parallax(config.parallax || 1.0),
        Renderable({
            [layer]: {
                type: 'watercolor',
                shape: shapeType === 'oval' ? 'oval' : 'rect',
                width: config.width || 100,
                height: config.height || 100,
                color: config.color || 0x444444,
                alpha: config.alpha ?? 1.0,
                layers: 6,
                depth: depth
            }
        })
    ];
};
