import { Position, Graphic, Targetable } from '../components/index';

export const createTarget = (x, y) => {
    return [
        Position(x, y),
        Graphic('rect', 0xff0000), // RenderSystem will handle 'rect'
        Targetable()
    ];
};