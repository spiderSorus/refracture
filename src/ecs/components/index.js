import { PHYSICS } from '../../core/Constants';

export const Position = (x = 0, y = 0) => ({ _type: 'Position', x, y });
export const Velocity = (x = 0, y = 0) => ({ _type: 'Velocity', x, y });
export const AngularVelocity = (rate = 0) => ({ _type: 'AngularVelocity', rate }); // rate in radians per second
export const Rotation = (angle = 0) => ({ _type: 'Rotation', angle });

export const Renderable = (definitions = {}) => ({
    _type: 'Renderable',
    definitions,
    activeVisuals: {}
});

export const PlayerTag = () => ({ _type: 'PlayerTag' });
export const InputControlled = () => ({ _type: 'InputControlled' });
export const CameraTarget = () => ({ _type: 'CameraTarget' });
export const EntityType = (type) => ({ _type: 'EntityType', value: type });
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
export const AnchorTag = () => ({ _type: 'AnchorTag' });
export const BackgroundTag = () => ({ _type: 'BackgroundTag' });
export const SpawnTag = () => ({ _type: 'SpawnTag' });
export const StaticTag = () => ({ _type: 'StaticTag' });
export const SeesawTag = (stiffness = 0, maxRotation = 0.8) => ({ 
    _type: 'SeesawTag', 
    stiffness,    // 0 = stay in place, >0 = spring back to 0 angle
    maxRotation   // null or 0 = free spinning, >0 = clamped range
});

export const BackgroundShape = (shapeType = 'rect', config = {}) => ({
    _type: 'BackgroundShape',
    shapeType,
    width: config.width || 100,
    height: config.height || 100,
    color: config.color || 0xffffff,
    alpha: config.alpha ?? 1.0,
    depth: config.depth ?? 0
});

export const Parallax = (factor = 1.0) => ({
    _type: 'Parallax',
    factor,
    originX: null,
    originY: null
});

export const ZLayer = (type = 'PLAY', index = 0, layerName = null) => ({
    _type: 'ZLayer',
    type, // 'PLAY', 'BACKGROUND', 'FOREGROUND', or 'UI'
    index,
    layerName // Specific auxiliary layer name (e.g. 'bg_watercolor')
});

export const Mass = (value = 1) => ({ _type: 'Mass', value });
export const Ego = (value = 128) => ({ _type: 'Ego', value });
export const Spin = (rate = 0) => ({ _type: 'Spin', rate }); // rate in radians per second

export const ConnectionPoint = (x = 0, y = 0) => ({
    _type: 'ConnectionPoint',
    x, y
});

// --- NEW COMPONENTS ---

// Active tether (Player -> Platform)
export const WebTether = (platformId, anchorOffset = { x: 0, y: 0 }) => ({
    _type: 'WebTether',
    platformId,
    anchorOffset,
    maxLength: PHYSICS.WEB_MAX_LENGTH,
    currentLength: PHYSICS.WEB_INITIAL_LENGTH,
    stiffness: PHYSICS.WEB_STIFFNESS,
    damping: 0.05,
    maxForce: 5000,
    tension: 0,
    wrapPoints: []
});

// Static connection (Platform A -> Platform B)
export const WebConnection = (fromId, fromOffset, toId, toOffset) => ({
    _type: 'WebConnection',
    fromId,
    fromOffset,
    toId,
    toOffset,
    fixedLength: 100,
    stiffness: PHYSICS.WEB_STIFFNESS,
    maxForce: 8000,
    tension: 0,
    transferRate: 10, // Ego flow per second
    wrapPoints: []
});

export const EnergySource = (strength = 100, type = 'EMIT') => ({
    _type: 'EnergySource',
    strength, // +100 or -100
    type      // 'EMIT' or 'ABSORB'
});

export const BugTag = () => ({ _type: 'BugTag' });
export const WallTag = () => ({ _type: 'WallTag' });
export const GravityExempt = () => ({ _type: 'GravityExempt' });

export const BugAI = () => ({
    _type: 'BugAI',
    timer: 0,
    changeInterval: 1000,
    speed: 150
});

// --- SLINGSHOT MECHANIC ---
export const SlingshotJump = (maxForce = PHYSICS.SLINGSHOT_FORCE) => ({
    _type: 'SlingshotJump',
    isCharging: false,
    isJumping: false,
    lastPlatformId: null,
    vector: { x: 0, y: 0 },
    lockedAim: null,      // Normalized direction of the pull
    peakMagnitude: 0,     // Highest magnitude reached during this charge
    chargeRatio: 0,
    maxForce,
    canJump: false,       // Tracks if we are touching a surface
    dwellFrames: 0,       // Frame counter for attachment logic
    potentialPlatformId: null
});

// --- LIFECYCLE COMPONENTS ---
export const Destructible = (onDestroy = null) => ({
    _type: 'Destructible',
    onDestroy
});

export const Respawn = (delay = 1000) => ({
    _type: 'Respawn',
    delay,
    timer: 0,
    isPending: false
});
