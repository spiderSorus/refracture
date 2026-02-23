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
        },
        'GLOW': {
            type: 'fairy_glow',
            color: 0xffffff,
            scale: 2.0,
            depth: -1
        }
    }),
    PlayerTag(),
    Mass(1.5),
    InputControlled(),
    CameraTarget(),
    ViewLayers(['BASE', 'GLOW'])
];

export const findPlayer = (entities) => entities.find(e => e.components.PlayerTag);