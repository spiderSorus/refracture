import {
    Position, Velocity, Rotation, Renderable,
    PlayerTag, InputControlled, CameraTarget, ViewLayers,
    Mass
} from '../components/index';

export const createPlayer = (x, y) => [
    Position(x, y),
    Velocity(0, 0),
    Rotation(0),
    Renderable({
        'BASE': {
            type: 'spider',
            color: 0x222222,
            size: 1.0
        }
    }),
    PlayerTag(),
    Mass(1.5),
    InputControlled(),
    CameraTarget(),
    ViewLayers(['BASE'])
];

export const findPlayer = (entities) => entities.find(e => e.components.PlayerTag);