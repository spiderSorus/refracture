export const Position = (x = 0, y = 0) => ({ _type: 'Position', x, y });
export const Velocity = (x = 0, y = 0) => ({ _type: 'Velocity', x, y });
export const Rotation = (angle = 0) => ({ _type: 'Rotation', angle });

export const Renderable = (definitions = {}) => ({
    _type: 'Renderable',
    definitions,
    activeVisuals: {}
});

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

export const ConnectionPoint = (x = 0, y = 0) => ({
    _type: 'ConnectionPoint',
    x, y
});

// --- NEW COMPONENTS ---

// Active tether (Player -> Platform)
export const WebTether = (platformId, anchorOffset = { x: 0, y: 0 }) => ({
    _type: 'WebTether',
    platformId,
    anchorOffset
});

// Static connection (Platform A -> Platform B)
export const WebConnection = (fromId, fromOffset, toId, toOffset) => ({
    _type: 'WebConnection',
    fromId,
    fromOffset, // {x, y}
    toId,
    toOffset    // {x, y}
});

export const EnergySource = (strength = 100, type = 'EMIT') => ({
    _type: 'EnergySource',
    strength, // +100 or -100
    type      // 'EMIT' or 'ABSORB'
});

// --- SLINGSHOT MECHANIC ---
export const SlingshotJump = (maxForce = 1500) => ({
    _type: 'SlingshotJump',
    isCharging: false,
    vector: { x: 0, y: 0 },
    chargeRatio: 0,
    maxForce,
    canJump: false // Tracks if we are touching a surface
});