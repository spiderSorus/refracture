import Phaser from 'phaser';
import { UI } from '../../core/UIManager';
import { InputManager } from '../../core/Input';
import { GRID, PHYSICS } from '../../core/Constants';

// Import Systems (Removed DebugLayerSystem)
import {
    MovementSystem,
    AttachmentSystem,
    AbilityTargetingSystem,
    PhysicsSystem,
    CameraSystem,
    RenderSystem,
    TargetRenderSystem
} from '../../ecs/systems/index';

export class BaseTestScene extends Phaser.Scene {
    constructor(key, title, subtitle) {
        super(key);
        this.testTitle = title || "Test Scene";
        this.testSubtitle = subtitle || "No description provided.";
        this.accumulator = 0;
    }

    create() {
        // 1. Reset Entities
        this.entities = [];

        // 2. Setup Input & UI
        this.inputManager = new InputManager(this);
        const titleStr = this.testTitle || 'SCENE';
        UI.showTitle(titleStr, this.testSubtitle);

        this.input.keyboard.on('keydown-TAB', () => {
            this.showDebugGrid = !this.showDebugGrid;
            UI.toggleDebug();
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('TestMenuScene');
        });
    }

    update(time, delta) {
        // --- FIXED TIMESTEP LOOP ---
        this.accumulator += delta;

        while (this.accumulator >= PHYSICS.STEP) {
            const dtSeconds = PHYSICS.STEP / 1000;

            // 1. Game Logic Systems
            MovementSystem(this.entities, this.inputManager, dtSeconds);
            AttachmentSystem(this.entities, this.inputManager);
            AbilityTargetingSystem(this.entities, this.inputManager);

            // 2. Scene-Specific Logic Hook
            this.fixedUpdate(time, PHYSICS.STEP);

            // 3. Physics Integration
            PhysicsSystem(this.entities, PHYSICS.STEP);

            this.accumulator -= PHYSICS.STEP;
        }

        // --- RENDER LOOP (Every Frame) ---
        TargetRenderSystem(this.entities, this);
        CameraSystem(this.entities, this);
        RenderSystem(this.entities, this);

        // Removed DebugLayerSystem(this.entities, this);

        this.updateDebugUI();
    }

    fixedUpdate(time, dt) { }

    updateDebugUI() {
        const player = this.entities.find(e => e.components.PlayerTag);
        if (player) {
            const p = player.components.Position;
            const t = player.components.AbilityState?.currentTargetId
                ? { id: player.components.AbilityState.currentTargetId }
                : null;

            UI.updateDebug({
                x: p.x.toFixed(0),
                y: p.y.toFixed(0),
                gx: (p.x / GRID.UNIT).toFixed(1),
                gy: (p.y / GRID.UNIT).toFixed(1)
            }, t);
        }
    }

    addEntity(componentsArray) {
        const config = componentsArray.find(c => c.id && !c._type);
        const entity = {
            id: config ? config.id : crypto.randomUUID(),
            components: {}
        };
        componentsArray.forEach(c => {
            if (c && c._type) entity.components[c._type] = c;
        });
        this.entities.push(entity);
        return entity;
    }
}