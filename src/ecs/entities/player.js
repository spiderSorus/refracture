import {
    Position, Velocity, Rotation, Graphic,
    PlayerTag, InputControlled, CameraTarget
} from '../components/index';

export const createPlayer = (x, y) => [
    Position(x, y),
    Velocity(0, 0),
    Rotation(0),
    Graphic('triangle', 0x00ffff, 12), // Explicit size 12
    PlayerTag(),
    InputControlled(),
    CameraTarget() // Makes the CameraSystem focus on the player
];