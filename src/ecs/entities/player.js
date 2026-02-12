import {
    Position, Velocity, Rotation, Graphic,
    PlayerTag, InputControlled
} from '../components/index';

export const createPlayer = (x, y) => [
    Position(x, y),
    Velocity(0, 0),
    Rotation(0), // Initialize at 0 radians (facing East)
    Graphic('triangle', 0x00ffff),
    PlayerTag(),
    InputControlled()
];