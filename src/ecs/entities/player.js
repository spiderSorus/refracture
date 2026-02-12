import {
    Position,
    Velocity,
    Graphic,
    InputControlled,
    PlayerTag,
    Targeter
} from '../components/index';

export const createPlayer = (x, y) => {
    return [
        Position(x, y),
        Velocity(0, 0),
        Graphic('circle', 0x00ff00),
        InputControlled(),
        PlayerTag(),
        Targeter()
    ];
};