import { createPlayer } from '../../ecs/entities/player';
import { createTarget } from '../../ecs/entities/target';
import { CameraTarget } from '../../ecs/components/index';
import {
    MovementSystem,
    PhysicsSystem,
    RenderSystem,
    CameraSystem
} from '../../ecs/systems/index';
import { BaseTestScene } from './BaseTestScene';

export class CameraTest extends BaseTestScene {
    constructor() {
        super('CameraTest', 'Camera Test', 'Dynamic framing and auto-zoom demo');
    }

    create() {
        // 1. Initialize Base (Input, UI, Grid state)
        super.create();

        // 2. Create Entities using the method defined in the parent
        const player = this.addEntity([
            ...createPlayer(400, 300),
            CameraTarget()
        ]);

        const target = this.addEntity([
            ...createTarget(600, 500),
            CameraTarget()
        ]);

        // 3. Set initial state
        if (player.components.Targeter) {
            player.components.Targeter.currentTarget = target.id;
        }
    }

    update(time, delta) {
        // Check if we are still in the scene
        if (!super.update(time, delta)) return;

        // Run Systems
        MovementSystem(this.entities, this.inputManager);
        RenderSystem(this.entities, this);
        PhysicsSystem(this.entities, delta);
        CameraSystem(this.entities, this);
    }
}