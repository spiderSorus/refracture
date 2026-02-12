import Phaser from 'phaser';
import { InputManager } from '../../core/Input';
import { createPlayer } from '../../ecs/entities/player';
import { createTarget } from '../../ecs/entities/target';
import { CameraTarget } from '../../ecs/components/index';
import {
    MovementSystem,
    PhysicsSystem,
    RenderSystem,
    DebugSystem,
    CameraSystem
} from '../../ecs/systems/index';

export class CameraTest extends Phaser.Scene {
    constructor() {
        super('CameraTest');
        this.entities = [];
    }

    create() {
        this.inputManager = new InputManager(this);
        this.debugSystem = new DebugSystem(this);

        // 1. Create Player & Tag for Camera
        const playerParts = createPlayer(400, 300);
        playerParts.push(CameraTarget());
        const player = this.addEntity(playerParts);

        // 2. Create Target & Tag for Camera
        const targetParts = createTarget(600, 500);
        targetParts.push(CameraTarget());
        const target = this.addEntity(targetParts);

        // 3. Force Initial Target State
        player.components.Targeter.currentTarget = target.id;

        this.add.text(20, 20, '02_CameraTest', { font: '20px monospace', fill: '#fff' }).setScrollFactor(0);
        this.add.text(20, 50, 'Move away to see dynamic zoom', { font: '16px monospace', fill: '#aaa' }).setScrollFactor(0);
    }

    update(time, delta) {
        if (this.inputManager.getAction('BACK')) {
            this.scene.start('TestMenuScene');
            return;
        }

        // ECS Flow
        MovementSystem(this.entities, this.inputManager);
        RenderSystem(this.entities, this);
        PhysicsSystem(this.entities, delta);
        CameraSystem(this.entities, this); // Manage Zoom/Pan
        this.debugSystem.update(this.entities);
    }

    addEntity(componentsArray) {
        const entity = {
            id: crypto.randomUUID(),
            components: {}
        };
        componentsArray.forEach(c => { if (c._type) entity.components[c._type] = c; });
        this.entities.push(entity);
        return entity;
    }
}