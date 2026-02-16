import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import {
    MovementSystem,
    PhysicsSystem,
    RenderSystem,
    CameraSystem
} from '../../ecs/systems/index';

export class MovementTest extends BaseTestScene {
    constructor() {
        super('MovementTest', 'Basic Movement', 'Use Arrows/WASD or Left Stick to move.');
    }

    create() {
        super.create();
        // createPlayer already includes PlayerTag and CameraTarget
        this.addEntity([...createPlayer(400, 300)]);
    }

    update(time, delta) {
        if (!super.update(time, delta)) return;

        // Core ECS Loop
        MovementSystem(this.entities, this.inputManager);
        PhysicsSystem(this.entities, delta);

        // Essential for the camera to actually move!
        CameraSystem(this.entities, this);

        RenderSystem(this.entities, this);
    }
}