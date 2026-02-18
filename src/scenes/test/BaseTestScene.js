import Phaser from 'phaser';
import { UI } from '../../core/UIManager';
import { InputManager } from '../../core/Input';
import { GRID, PHYSICS } from '../../core/Constants';

import {
    MovementSystem,
    AttachmentSystem,
    AbilityTargetingSystem,
    PhysicsSystem,
    CameraSystem,
    LayeredRenderSystem,
    TargetRenderSystem,
    DebugLayerSystem,
    WebRenderSystem,
    WebSystem
} from '../../ecs/systems/index';

export class BaseTestScene extends Phaser.Scene {
    constructor(key, title, subtitle) {
        super(key);
        this.testTitle = title || "Test Scene";
        this.testSubtitle = subtitle || "No description provided.";
        this.accumulator = 0;
    }

    create() {
        this.entities = [];
        this.inputManager = new InputManager(this);

        const titleStr = this.testTitle || 'SCENE';
        UI.showTitle(titleStr, this.testSubtitle);

        // --- CLEANUP HANDLER ---
        // This ensures that when we switch scenes, everything resets
        this.events.once('shutdown', this.shutdown, this);

        // Inputs
        this.input.keyboard.on('keydown-TAB', () => {
            this.showDebugGrid = !this.showDebugGrid;
            UI.toggleDebug();
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('TestMenuScene');
        });
    }

    // Called automatically when scene stops
    shutdown() {
        // 1. Clear Entities
        this.entities = [];

        // 2. Clear Input Listeners (Prevent double-triggering X or ESC)
        this.input.keyboard.off('keydown-TAB');
        this.input.keyboard.off('keydown-ESC');

        // 3. Clear any UI text residue
        if (this.debugText) {
            this.debugText.destroy();
            this.debugText = null;
        }

        // 4. Reset Accumulator
        this.accumulator = 0;
    }

    update(time, delta) {
        // If scene is shutting down, stop updating to prevent crashes
        if (!this.sys.isActive()) return;

        this.accumulator += delta;

        // 1. FIXED UPDATE LOOP
        while (this.accumulator >= PHYSICS.STEP) {
            const dtSeconds = PHYSICS.STEP / 1000;

            WebSystem(this.entities, this.inputManager);
            MovementSystem(this.entities, this.inputManager, dtSeconds);
            AttachmentSystem(this.entities, this.inputManager);
            AbilityTargetingSystem(this.entities, this.inputManager);

            this.fixedUpdate(time, PHYSICS.STEP);
            PhysicsSystem(this.entities, PHYSICS.STEP);

            this.accumulator -= PHYSICS.STEP;
        }

        // 2. RENDER LOOP
        WebRenderSystem(this.entities, this);
        TargetRenderSystem(this.entities, this);
        CameraSystem(this.entities, this);
        LayeredRenderSystem(this.entities, this);
        DebugLayerSystem(this.entities, this);

        this.updateDebugUI();
    }

    fixedUpdate(time, dt) { }

    updateDebugUI() {
        const player = this.entities.find(e => e.components.PlayerTag);
        if (player) {
            const p = player.components.Position;
            let tInfo = null;
            if (player.components.WebTether) tInfo = { id: "ANCHORED" };
            else if (player.components.AbilityState?.currentTargetId) tInfo = { id: "TARGETING" };

            UI.updateDebug({
                x: p.x.toFixed(0),
                y: p.y.toFixed(0),
                gx: (p.x / GRID.UNIT).toFixed(1),
                gy: (p.y / GRID.UNIT).toFixed(1)
            }, tInfo);
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