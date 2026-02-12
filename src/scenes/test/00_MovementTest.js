import { createPlayer } from '../../ecs/entities/player';
import { MovementSystem, PhysicsSystem, RenderSystem } from '../../ecs/systems/index';
import { BaseTestScene } from './BaseTestScene';

export class MovementTest extends BaseTestScene {
    constructor() {
        // Key, Title, Subtitle
        super('MovementTest', 'Movement Test', 'Standard 8-way movement. Use Arrows or Left Stick.');
    }

    create() {
        super.create(); // This initializes this.inputManager and the UI

        // Spawn Player at Grid 40, 30 (400px, 300px)
        this.addEntity(createPlayer(400, 300));
    }

    update(time, delta) {
        // super.update handles ESC, Blue Grid, and HTML Debug Console
        if (!super.update(time, delta)) return;

        // Scene Logic
        MovementSystem(this.entities, this.inputManager);
        RenderSystem(this.entities, this);
        PhysicsSystem(this.entities, delta);
    }
}