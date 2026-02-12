export const Position = (x = 0, y = 0) => ({ _type: 'Position', x, y });
export const Velocity = (x = 0, y = 0) => ({ _type: 'Velocity', x, y });
export const Rotation = (angle = 0) => ({ _type: 'Rotation', angle }); // NEW
export const Graphic = (texture = 'rect', color = 0xffffff) => ({ _type: 'Graphic', texture, color });
export const PlayerTag = () => ({ _type: 'PlayerTag' });
export const InputControlled = () => ({ _type: 'InputControlled' });
export const CameraTarget = () => ({ _type: 'CameraTarget' });
export const EntityType = (type) => ({ _type: 'EntityType', value: type });
export const AbilityState = () => ({
    _type: 'AbilityState', armed: null, targetIndex: 0, potentialTargets: [], currentTargetId: null
});