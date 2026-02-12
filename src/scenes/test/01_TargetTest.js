import { createPlayer } from '../../ecs/entities/player';
import { createTarget } from '../../ecs/entities/target';
import {
    MovementSystem,
    PhysicsSystem,
    RenderSystem,
    TargetingSystem
} from '../../ecs/systems/index';
import { BaseTestScene } from './BaseTestScene';

export class TargetTest extends BaseTestScene {
    constructor() {
        super('TargetTest', 'Targeting Test', 'Proximity selection. Targets turn red when locked.');
    }

    create() {
        super.create();

        // Spawn Entities
        this.addEntity(createPlayer(400, 300));
        this.addEntity(createTarget(200, 200));
        this.addEntity(createTarget(600, 200));
        this.addEntity(createTarget(600, 500));
        this.addEntity(createTarget(200, 500));
    } // Ensure this brace exists!

    update(time, delta) {
        if (!super.update(time, delta)) return;

        // Pass this.inputManager (defined in BaseTestScene)
        MovementSystem(this.entities, this.inputManager);
        TargetingSystem(this.entities);
        RenderSystem(this.entities, this);
        PhysicsSystem(this.entities, delta);
    }
}