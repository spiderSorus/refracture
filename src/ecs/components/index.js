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
    currentTarget: null // Will store the entity ID of the target
});

export const Debug = () => ({
    _type: 'Debug'
});

export const CameraTarget = () => ({
    _type: 'CameraTarget'
});