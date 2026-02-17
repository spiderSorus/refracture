import {
    Position, Velocity, Rotation, Renderable, // Changed from Graphic
    PlayerTag, InputControlled, CameraTarget, ViewLayers
} from '../components/index';

export const createPlayer = (x, y) => [
    Position(x, y),
    Velocity(0, 0),
    Rotation(0),
    // Define the Player's visual. We use 'BASE' layer by default.
    Renderable({
        'BASE': {
            type: 'sprite',
            char: 'P',      // Or use a triangle shape logic in SpriteGraphic
            color: '#00ffff',
            size: 1.2
        }
    }),
    PlayerTag(),
    InputControlled(),
    CameraTarget(),
    // Player needs to see things!
    ViewLayers(['BASE'])
];