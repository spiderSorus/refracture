// --- Component Definitions ---

export const Position = (x = 0, y = 0) => ({
    _type: 'Position',
    x,
    y
});

export const Velocity = (x = 0, y = 0) => ({
    _type: 'Velocity',
    x,
    y
});

export const Graphic = (texture, color = 0xffffff) => ({
    _type: 'Graphic',
    texture,
    color,
    sprite: null
});

export const InputControlled = () => ({
    _type: 'InputControlled'
});

export const PlayerTag = () => ({
    _type: 'PlayerTag'
});

export const Targetable = () => ({
    _type: 'Targetable'
});

export const Targeter = () => ({
    _type: 'Targeter',
    currentTarget: null
});

export const CameraTarget = () => ({
    _type: 'CameraTarget'
});

export const Debug = () => ({
    _type: 'Debug'
});
export const EntityType = (type) => ({ _type: 'EntityType', value: type }); // 'A', 'B', or 'C'
export const AbilityState = () => ({
    _type: 'AbilityState',
    armed: null,          // 'X', 'Y', or null
    targetIndex: 0,
    potentialTargets: [],
    currentTargetId: null
});

