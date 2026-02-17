export const Position = (x = 0, y = 0) => ({ _type: 'Position', x, y });
export const Velocity = (x = 0, y = 0) => ({ _type: 'Velocity', x, y });
export const Rotation = (angle = 0) => ({ _type: 'Rotation', angle });

// REMOVED: Old Graphic component
// REPLACED BY: Renderable
export const Renderable = (definitions = {}) => ({
    _type: 'Renderable',
    // definitions: { 'LAYER_NAME': { type: 'sprite', texture: 'x', ... } }
    definitions,
    // internal cache for Phaser GameObjects: { 'LAYER_NAME': GameObject }
    activeVisuals: {}
});

// Controls what the entity (usually Player) can SEE
export const ViewLayers = (layers = ['BASE']) => ({
    _type: 'ViewLayers',
    layers
});

export const PlayerTag = () => ({ _type: 'PlayerTag' });
export const InputControlled = () => ({ _type: 'InputControlled' });
export const CameraTarget = () => ({ _type: 'CameraTarget' });
export const EntityType = (type) => ({ _type: 'EntityType', value: type });
export const AbilityState = () => ({
    _type: 'AbilityState', armed: null, targetIndex: 0, potentialTargets: [], currentTargetId: null
});
export const Parent = (entityId, offset = { x: 0, y: 0 }) => ({
    _type: 'Parent',
    id: entityId,
    offset
});
export const Collider = (type = 'circle', radius = 50, width = 100, height = 100) => ({
    _type: 'Collider',
    type, radius, width, height
});
export const PlatformTag = () => ({ _type: 'PlatformTag' });