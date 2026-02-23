// src/scenes/test/BaseTestScene.js
import Phaser from 'phaser';
import { UI } from '../../core/UIManager';
import { InputManager } from '../../core/Input';
import { GRID, PHYSICS } from '../../core/Constants';

// We import systems directly from their files to bypass the index.js conflict 
// and get you back to a working state immediately.
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

        // Initialize UI Overlay
        UI.showTitle(this.testTitle, this.testSubtitle);

        // Global Key Listeners
        this.input.keyboard.on('keydown-TAB', () => UI.toggleDebug());
        this.input.keyboard.on('keydown-ESC', () => this.scene.start('TestMenuScene'));

        this.events.once('shutdown', this.shutdown, this);

        // Run sub-scene specific setup
        this.setupScene();
    }

    setupScene() {
        // Default implementation - override this in child classes
    }

    shutdown() {
        this.entities = [];
        this.input.keyboard.off('keydown-TAB');
        this.input.keyboard.off('keydown-ESC');
        this.accumulator = 0;
    }

    /**
     * The Heart of the ECS: The Game Loop
     */
    update(time, delta) {
        if (!this.sys.isActive()) return;

        this.accumulator += delta;

        // --- STEP 1: THE SIMULATION (Fixed Timestep) ---
        // We run these at 60Hz to ensure slingshot math is consistent.
        while (this.accumulator >= PHYSICS.STEP) {
            const dtSeconds = PHYSICS.STEP / 1000;

            // Intent Systems (Capture Stick/Buttons)
            SlingshotSystem(this.entities, this.inputManager);
            WebSystem(this.entities, this.inputManager);
            AbilityTargetingSystem(this.entities, this.inputManager);

            // Constraint Systems (Parenting & Dwell)
            AttachmentSystem(this.entities);

            // Motion Systems (Walking & Gravity)
            MovementSystem(this.entities, this.inputManager, dtSeconds);

            // Integration System (Calculates final X/Y based on Parents/Floor)
            PhysicsSystem(this.entities, PHYSICS.STEP);

            this.fixedUpdate(time, PHYSICS.STEP);
            this.accumulator -= PHYSICS.STEP;
        }

        // --- STEP 2: THE RENDER PASS ---
        // CRITICAL ORDER: Sync Phaser Sprites to ECS Position *before* drawing overlays.

        // 1. Sync Sprites/Triangles to their new ECS Positions
        LayeredRenderSystem(this.entities, this);

        // 2. Draw procedural graphics (Indicator/Webs/Targets) on top of the synced sprites
        SlingshotRenderSystem(this.entities, this);
        WebRenderSystem(this.entities, this);
        TargetRenderSystem(this.entities, this);

        // 3. Update Camera and HUD
        CameraSystem(this.entities, this);
        DebugLayerSystem(this.entities, this);

        // 4. Update the Telemetry UI
        this.updateDebugUI();
    }

    fixedUpdate(time, dt) { }

    updateDebugUI() {
        const player = this.entities.find(e => e.components.PlayerTag);
        if (player) {
            const sling = player.components.SlingshotJump || {};
            const rawStick = this.inputManager.getRightStickRaw(); // Add this line

            UI.updateDebug({
                x: Math.round(player.components.Position.x),
                y: Math.round(player.components.Position.y)
            }, {
                status: player.components.Parent ? "ATTACHED" : "FREE",
                sling: {
                    isCharging: sling.isCharging,
                    rawStick: rawStick, // Pass raw data here
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