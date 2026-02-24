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
                // Force player to spawn position
                player.components.Position.x = spawnPoint.components.Position.x;
                player.components.Position.y = spawnPoint.components.Position.y;
                
                // Create Parent component
                player.components.Parent = {
                    _type: 'Parent',
                    id: spawnPoint.id,
                    offset: { x: 0, y: 0 }
                };
                
                // Reset Slingshot
                if (player.components.SlingshotJump) {
                    player.components.SlingshotJump.canJump = true;
                }
                
                console.log(`[BASE] Baked-in attachment: Player -> ${spawnPoint.id}`);
            }

            // --- GLOW EFFECTS (Floor & Walls) ---
            const glowGfx = this.add.graphics();
            const cam = this.cameras.main;
            const bounds = cam.getBounds();
            const minX = bounds.x;
            const maxX = bounds.x + bounds.width;
            const minY = bounds.y;
            const maxY = bounds.y + bounds.height;

            for (let i = 1; i <= 5; i++) {
                glowGfx.lineStyle(i * 6, 0x0000ff, 0.5 / i);
                glowGfx.lineBetween(minX - 5000, maxY, maxX + 5000, maxY); 
                glowGfx.lineBetween(minX, minY, minX, maxY);
                glowGfx.lineBetween(maxX, minY, maxX, maxY);
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
