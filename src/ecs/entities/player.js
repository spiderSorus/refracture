import {
    Position, Velocity, Rotation, Renderable,
    PlayerTag, InputControlled, CameraTarget, ViewLayers
} from '../components/index';

export const createPlayer = (x, y) => [
    Position(x, y),
    Velocity(0, 0),
    Rotation(0),
    Renderable({
        'BASE': {
            type: 'triangle',
            color: '#ff8400',
            // size: 5.0 -> Radius 50px (5 units) -> Total Width 100px (10 units)
            // If this is still "Huge", try size: 2.5 (50px width) or size: 0.5 (10px width).
            size: 1.0
        }
    }),
    PlayerTag(),
    InputControlled(),
    CameraTarget(),
    ViewLayers(['BASE'])
];

export const findPlayer = (entities) => entities.find(e => e.components.PlayerTag);