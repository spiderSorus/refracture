import Phaser from 'phaser';
import { UI } from '../../core/UIManager';
import { InputManager } from '../../core/Input';
import { GRID, PHYSICS } from '../../core/Constants';
import { spawnPlayer } from '../../ecs/entities/player';

import { MovementSystem } from '../../ecs/systems/MovementSystem';
import { AttachmentSystem } from '../../ecs/systems/AttachmentSystem';
import { PhysicsSystem } from '../../ecs/systems/PhysicsSystem';
import { CameraSystem } from '../../ecs/systems/CameraSystem';
import { LayeredRenderSystem } from '../../ecs/systems/LayeredRenderSystem';
import { WebRenderSystem } from '../../ecs/systems/WebRenderSystem';
import { WebSystem } from '../../ecs/systems/WebSystem';
import { BugAISystem } from '../../ecs/systems/BugAISystem';
import { EnergySystem } from '../../ecs/systems/EnergySystem';
import { LifecycleSystem } from '../../ecs/systems/LifecycleSystem';
import { BackgroundSystem } from '../../ecs/systems/BackgroundSystem';
import { ParallaxSystem } from '../../ecs/systems/ParallaxSystem';
import { ZLayerSystem } from '../../ecs/systems/ZLayerSystem';
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
        this.inputManager = null;
        this.input.keyboard.off('keydown-TAB');
        this.input.keyboard.off('keydown-ESC');
        this.accumulator = 0;
        this.initialized = false;
    }

    update(time, delta) {
        if (!this.sys.isActive()) return;

        // --- FIRST FRAME INITIALIZATION ---
        if (!this.initialized) {
            const spawnPoint = this.entities.find(e => e.components.SpawnTag);
            const player = this.entities.find(e => e.components.PlayerTag);

            if (!spawnPoint) {
                console.error("no spawnpoint detected:");
                this.scene.start('TestMenuScene');
                return;
            }

            // BAKE-IN ATTACHMENT: Start player attached to spawnpoint
            if (player) {
                // If player already exists (from scene setup), we just re-spawn/re-attach them properly
                // But typically we should just use spawnPlayer if they don't exist yet or to reset them.
                // For now, let's just make sure they are attached.
                player.toDestroy = true; // Clear the existing one and use spawnPlayer for consistency
                spawnPlayer(this, spawnPoint);
            }

            // --- GLOW EFFECTS (Floor & Walls) ---
            const glowGfx = this.add.graphics();
            const cam = this.cameras.main;
            
            // Use camera bounds if available, otherwise fallback to viewport
            const minX = cam.useBounds ? cam._bounds.x : 0;
            const maxX = cam.useBounds ? cam._bounds.x + cam._bounds.width : cam.width;
            const minY = cam.useBounds ? cam._bounds.y : 0;
            const maxY = cam.useBounds ? cam._bounds.y + cam._bounds.height : cam.height;

            for (let i = 1; i <= 5; i++) {
                glowGfx.lineStyle(i * 6, 0x0000ff, 0.5 / i);
                glowGfx.lineBetween(minX, maxY, maxX, maxY); // Floor
                glowGfx.lineBetween(minX, minY, minX, maxY); // Left Wall
                glowGfx.lineBetween(maxX, minY, maxX, maxY); // Right Wall
            }
            glowGfx.setDepth(1);

            this.initialized = true;
        }

        this.inputManager.update();
        RecordingSystem(this, this.inputManager);

        this.accumulator += delta;

        while (this.accumulator >= PHYSICS.STEP) {
            const dtSeconds = PHYSICS.STEP / 1000;

            SlingshotSystem(this.entities, this.inputManager);
            WebSystem(this.entities, this.inputManager, this);
            EnergySystem(this.entities, dtSeconds, this);
            BugAISystem(this.entities, dtSeconds);
            AttachmentSystem(this.entities);
            LifecycleSystem(this.entities, dtSeconds, this);
            MovementSystem(this.entities, this.inputManager, dtSeconds);
            PhysicsSystem(this.entities, PHYSICS.STEP, this);

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

        CameraSystem(this.entities, this, this.inputManager);
        ParallaxSystem(this.entities, this);
        ZLayerSystem(this.entities);

        LayeredRenderSystem(this.entities, this);
        SlingshotRenderSystem(this.entities, this);
        WebRenderSystem(this.entities, this);

        this.updateDebugUI();
    }

    fixedUpdate(time, dt) { }

    updateDebugUI() {
        const player = this.entities.find(e => e.components.PlayerTag);
        if (player) {
            const sling = player.components.SlingshotJump || {};
            const rawStick = this.inputManager.getRightStickRaw();

            UI.updateDebug({
                scene: this.scene.key,
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
