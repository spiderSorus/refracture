import Phaser from 'phaser';
import { UI } from '../../core/UIManager';
import { InputManager } from '../../core/Input';
import { GRID, PHYSICS } from '../../core/Constants';

import { MovementSystem } from '../../ecs/systems/MovementSystem';
import { AttachmentSystem } from '../../ecs/systems/AttachmentSystem';
import { PhysicsSystem } from '../../ecs/systems/PhysicsSystem';
import { CameraSystem } from '../../ecs/systems/CameraSystem';
import { LayeredRenderSystem } from '../../ecs/systems/LayeredRenderSystem';
import { WebRenderSystem } from '../../ecs/systems/WebRenderSystem';
import { WebSystem } from '../../ecs/systems/WebSystem';
import { BugAISystem } from '../../ecs/systems/BugAISystem';
import { MeditationSystem } from '../../ecs/systems/MeditationSystem';
import { EnergySystem } from '../../ecs/systems/EnergySystem';
import { SlingshotSystem } from '../../ecs/systems/SlingshotSystem';
import { SlingshotRenderSystem } from '../../ecs/systems/SlingshotRenderSystem';
import { RecordingSystem } from '../../ecs/systems/RecordingSystem'; 

export class BaseTestScene extends Phaser.Scene {
    constructor(key, title, subtitle) {
        super(key || 'BaseTestScene');
        this.testTitle = title || "Slingshot Lab";
        this.testSubtitle = subtitle || "State & Render Sync Debug";
        this.accumulator = 0;
        this.initialized = false;
        
        // MEDITATION CONFIG
        this.meditationEnabled = false; 
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
        this.initialized = false;
    }

    update(time, delta) {
        if (!this.sys.isActive()) return;

        // ON FIRST FRAME: VALIDATE & ENFORCE MEDITATION RULES
        if (!this.initialized) {
            const spawnPoint = this.entities.find(e => e.components.SpawnTag);
            if (!spawnPoint) {
                console.error("no spawnpoint detected:");
                this.scene.start('TestMenuScene');
                return;
            }

            // Enforce Spawnpoint rules: always level 0
            if (spawnPoint.components.RealityLevel) {
                spawnPoint.components.RealityLevel.visible = [0];
                spawnPoint.components.RealityLevel.interact = [0];
            }

            // If meditation is disabled, snap EVERYTHING to level 0
            if (!this.meditationEnabled) {
                this.entities.forEach(e => {
                    if (e.components.RealityLevel) {
                        e.components.RealityLevel.visible = [0];
                    }
                    if (e.components.MeditationState) {
                        e.components.MeditationState.currentLevel = 0;
                    }
                });
            }

            this.initialized = true;
        }

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
            
            if (this.meditationEnabled) {
                MeditationSystem(this.entities, this.inputManager, dtSeconds);
            }

            EnergySystem(this.entities, dtSeconds);
            BugAISystem(this.entities, dtSeconds);
            AttachmentSystem(this.entities);
            MovementSystem(this.entities, this.inputManager, dtSeconds);
            PhysicsSystem(this.entities, PHYSICS.STEP, this);

            // Cleanup destroyed entities
            this.entities = this.entities.filter(e => {
                if (e.toDestroy) {
                    const renderable = e.components.Renderable;
                    if (renderable && renderable.activeVisuals) {
                        Object.values(renderable.activeVisuals).forEach(v => v.destroy());
                    }
                    return false;
                }
                return true;
            });

            this.fixedUpdate(time, PHYSICS.STEP);
            this.accumulator -= PHYSICS.STEP;
        }

        // --- STEP 2: THE RENDER PASS ---
        LayeredRenderSystem(this.entities, this);
        SlingshotRenderSystem(this.entities, this);
        WebRenderSystem(this.entities, this);
        CameraSystem(this.entities, this);

        this.updateDebugUI();
    }

    fixedUpdate(time, dt) { }

    updateDebugUI() {
        const player = this.entities.find(e => e.components.PlayerTag);
        if (player) {
            const sling = player.components.SlingshotJump || {};
            const meditation = player.components.MeditationState || {};
            const rawStick = this.inputManager.getRightStickRaw();

            UI.updateDebug({
                scene: this.scene.key,
                x: Math.round(player.components.Position.x),
                y: Math.round(player.components.Position.y)
            }, {
                reality: meditation.currentLevel || 0,
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
