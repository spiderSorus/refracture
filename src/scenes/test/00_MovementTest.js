import Phaser from 'phaser';
import { InputManager } from '../../core/Input';
import { createPlayer } from '../../ecs/entities/player';
import {
    MovementSystem,
    PhysicsSystem,
    RenderSystem
} from '../../ecs/systems/index';

export class MovementTest extends Phaser.Scene {
    constructor() {
        super('MovementTest');
        this.entities = [];
    }

    create() {
        this.inputManager = new InputManager(this);

        // Spawn Player
        this.addEntity(createPlayer(400, 300));

        // UI
        this.add.text(20, 20, '00_MovementTest', { font: '20px monospace', fill: '#fff' });
        this.add.text(20, 50, 'Use Arrows or Left Stick to Move', { font: '16px monospace', fill: '#aaa' });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('TestMenuScene');
        });
    }

    update(time, delta) {
        if (this.inputManager.getAction('BACK')) {
            this.scene.start('TestMenuScene');
            return;
        }

        // Systems
        MovementSystem(this.entities, this.inputManager);
        RenderSystem(this.entities, this);
        PhysicsSystem(this.entities, delta);
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