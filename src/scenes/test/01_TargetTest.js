import Phaser from 'phaser';
import { InputManager } from '../../core/Input';
import { createPlayer } from '../../ecs/entities/player';
import { createTarget } from '../../ecs/entities/target';
import {
    MovementSystem,
    PhysicsSystem,
    RenderSystem,
    TargetingSystem,
    DebugSystem
} from '../../ecs/systems/index';

export class TargetTest extends Phaser.Scene {
    constructor() {
        super('TargetTest');
        this.entities = [];
    }

    create() {
        this.inputManager = new InputManager(this);
        this.debugSystem = new DebugSystem(this); // Init Debug UI

        this.addEntity(createPlayer(400, 300));
        this.addEntity(createTarget(200, 200));
        this.addEntity(createTarget(600, 500));
    }

    update(time, delta) {
        if (this.inputManager.getAction('BACK')) {
            this.scene.start('TestMenuScene');
            return;
        }

        MovementSystem(this.entities, this.inputManager);
        TargetingSystem(this.entities);
        RenderSystem(this.entities, this);
        PhysicsSystem(this.entities, delta);

        // Pass entities to the debug update
        this.debugSystem.update(this.entities);
    }

    addEntity(componentsArray) {
        const entity = {
            id: crypto.randomUUID(),
            components: {}
        };
        componentsArray.forEach(c => {
            if (c._type) entity.components[c._type] = c;
        });
        this.entities.push(entity);
        return entity;
    }
}