import {
    Position, Rotation, Renderable,
    EntityType, PlatformTag, Collider, Parallax, ZLayer, BackgroundTag
} from '../components/index';

/**
 * Creates a cathedral column entity for backgrounds.
 * Supports parallax and automatic depth layering.
 */
export const createCathedralColumn = (x, y, config = {}) => {
    const layer = 'BASE';
    const parallaxFactor = config.parallax ?? 1.0;
    const zLayerType = config.zType || 'BACK'; // 'PLAY' or 'BACK'
    const zLayerIndex = config.zIndex ?? 0;
    const layerName = config.layerName || null;

    return [
        Position(x, y),
        Rotation(config.rotation || 0),
        PlatformTag(), // For system consistency
        BackgroundTag(),
        EntityType('CATHEDRAL_COLUMN'),
        Parallax(parallaxFactor),
        ZLayer(zLayerType, zLayerIndex, layerName),
        Renderable({
            [layer]: {
                type: 'watercolor',
                shape: 'rect',
                width: config.width || 50,
                height: config.height || 500,
                color: config.color || 0x880000,
                alpha: config.alpha ?? 1.0,
                layers: 6
            }
        }),
        Collider('rect', 1, 1, 1)
    ];
};
