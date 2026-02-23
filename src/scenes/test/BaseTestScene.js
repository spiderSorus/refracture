import Phaser from 'phaser';
import { UI } from '../../core/UIManager';
import { InputManager } from '../../core/Input';
import { GRID, PHYSICS } from '../../core/Constants';

import { MovementSystem } from '../../ecs/systems/MovementSystem';
import { AttachmentSystem } from '../../ecs/systems/AttachmentSystem';
import { AbilityTargetingSystem } from '../../ecs/systems/AbilityTargetingSystem';
import { PhysicsSystem } from '../../ecs/systems/PhysicsSystem';
import { CameraSystem } from '../../ecs/systems/CameraSystem';
import { LayeredRenderSystem } from '../../ecs/systems/LayeredRenderSystem';
import { TargetRenderSystem } from '../../ecs/systems/TargetRenderSystem';
import { DebugLayerSystem } from '../../ecs/systems/DebugLayerSystem';
import { WebRenderSystem } from '../../ecs/systems/WebRenderSystem';
import { WebSystem } from '../../ecs/systems/WebSystem';
import { SlingshotSystem } from '../../ecs/systems/SlingshotSystem';
import { SlingshotRenderSystem } from '../../ecs/systems/SlingshotRenderSystem';
import { RecordingSystem } from '../../ecs/systems/RecordingSystem'; // Ensure this exists

export class BaseTestScene extends Phaser.Scene {
    constructor(key, title, subtitle) {
        super(key || 'BaseTestScene');
        this.testTitle = title || "Slingshot Lab";
        this.testSubtitle = subtitle || "State & Render Sync Debug";
        this.accumulator = 0;
    }

    create() {
        this.entities = [];
        this.inputManager = new InputManager(this);

        UI.showTitle(this.testTitle, this.testSubtitle);

        this.input.keyboard.on('keydown-TAB', () => UI.toggleDebug());
        this.input.keyboard.on('keydown-ESC', () => this.scene.start('TestMenuScene'));

        this.events.once('shutdown', this.shutdown, this);
        this.setupScene();
    }

    setupScene() { }

    shutdown() {
        this.entities = [];
        this.input.keyboard.off('keydown-TAB');
        this.input.keyboard.off('keydown-ESC');
        this.accumulator = 0;
    }

    update(time, delta) {
        if (!this.sys.isActive()) return;

        // 1. Refresh Input Manager Polling
        this.inputManager.update();

        // 2. High-Priority Systems (Recording happens once per visual frame)
        RecordingSystem(this, this.inputManager);

        this.accumulator += delta;

        // --- STEP 1: THE SIMULATION (Fixed Timestep) ---
        while (this.accumulator >= PHYSICS.STEP) {
            const dtSeconds = PHYSICS.STEP / 1000;

            SlingshotSystem(this.entities, this.inputManager);
            WebSystem(this.entities, this.inputManager);
            AbilityTargetingSystem(this.entities, this.inputManager);
            AttachmentSystem(this.entities);
            MovementSystem(this.entities, this.inputManager, dtSeconds);
            PhysicsSystem(this.entities, PHYSICS.STEP);

            this.fixedUpdate(time, PHYSICS.STEP);
            this.accumulator -= PHYSICS.STEP;
        }

        // --- STEP 2: THE RENDER PASS ---
        LayeredRenderSystem(this.entities, this);
        SlingshotRenderSystem(this.entities, this);
        WebRenderSystem(this.entities, this);
        TargetRenderSystem(this.entities, this);
        CameraSystem(this.entities, this);
        DebugLayerSystem(this.entities, this);

        this.updateDebugUI();
    }

    fixedUpdate(time, dt) { }

    updateDebugUI() {
        const player = this.entities.find(e => e.components.PlayerTag);
        if (player) {
            const sling = player.components.SlingshotJump || {};
            const rawStick = this.inputManager.getRightStickRaw();

            UI.updateDebug({
                x: Math.round(player.components.Position.x),
                y: Math.round(player.components.Position.y)
            }, {
                status: player.components.Parent ? "ATTACHED" : "FREE",
                sling: {
                    isCharging: sling.isCharging,
                    rawStick: rawStick,
                    vecX: sling.vector ? sling.vector.x : 0,
                    vecY: sling.vector ? sling.vector.y : 0
                }
            });
        }
    }

    addEntity(componentsArray) {
        const config = componentsArray.find(c => c.id && !c._type);
        const entity = {
            id: config ? config.id : crypto.randomUUID(),
            components: {}
        };

        componentsArray.forEach(c => {
            if (c && c._type) {
                entity.components[c._type] = c;
            }
        });

        this.entities.push(entity);
        return entity;
    }
}