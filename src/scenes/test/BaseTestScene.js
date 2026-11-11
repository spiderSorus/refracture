import Phaser from 'phaser';
import { UI } from '../../core/UIManager';
import { InputManager } from '../../core/Input';
import { GRID, PHYSICS } from '../../core/Constants';
import { spawnPlayer } from '../../ecs/entities/player';

import { MovementSystem } from '../../ecs/systems/MovementSystem';
import { AttachmentSystem } from '../../ecs/systems/AttachmentSystem';
import { PhysicsSystem } from '../../ecs/systems/PhysicsSystem';
import { CameraSystem } from '../../ecs/systems/CameraSystem';
import { RenderSystem } from '../../ecs/systems/RenderSystem';
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
import { TargetSystem } from '../../ecs/systems/TargetSystem';
import { EffectSystem } from '../../ecs/systems/EffectSystem';
import { PathSystem } from '../../ecs/systems/PathSystem';
import { DriftSystem } from '../../ecs/systems/DriftSystem';
import { RecordingSystem } from '../../ecs/systems/RecordingSystem'; 
import { EnergyRules } from '../../ecs/systems/energy_logic/Rules';

export class BaseTestScene extends Phaser.Scene {
    constructor(key, title, subtitle) {
        super(key || 'BaseTestScene');
        this.testTitle = title || "Slingshot Lab";
        this.testSubtitle = subtitle || "State & Render Sync Debug";
        this.accumulator = 0;
        this.initialized = false;
        this.energyRules = this.energyRules || [];
        this.entities = [];
        this.entitiesMap = new Map();
        this.hasBoundaries = true; // Default to true
        this.enablePathDots = false; // Disable path follower dots
    }

    addEnergyRule(rule) {
        if (!this.energyRules.includes(rule)) {
            this.energyRules.push(rule);
        }
    }

    removeEnergyRule(rule) {
        this.energyRules = this.energyRules.filter(r => r !== rule);
    }

    enableEnergyRule(ruleName) {
        const rule = EnergyRules[ruleName];
        if (rule) {
            this.addEnergyRule(rule);
        } else {
            console.warn(`[ENERGY] Rule not found: ${ruleName}`);
        }
    }

    disableEnergyRule(ruleName) {
        this.energyRules = this.energyRules.filter(r => r.ruleName !== ruleName);
    }

    /**
     * Artist-friendly background layer & effect configurator.
     * Allows scenes to define visual layers with isolated post-processing shaders and parallax depths.
     * @param {Object} layersConfig Map of layer names to their shader effect and parallax depth:
     *   {
     *       haze:     { effect: 'watercolor', parallax: 0.15 },
     *       crystals: { effect: 'rainbow',    parallax: 0.40 },
     *       dust:     { effect: 'old_glass',  parallax: 0.75 }
     *   }
     */
    setupBackgroundLayers(layersConfig = {}) {
        if (!this.auxLayers) this.auxLayers = {};
        if (!this.auxCameras) this.auxCameras = {};
        if (!this.cameraConfigs) this.cameraConfigs = [];

        const newCameraConfigs = [];

        Object.entries(layersConfig).forEach(([layerKey, cfg], idx) => {
            // 1. Pre-create the Phaser Layer immediately (depth 30-80, strictly below playground at 100)
            const depth = 30 + idx * 5;
            if (!this.auxLayers[layerKey]) {
                const layer = this.add.layer().setName(layerKey.toUpperCase()).setDepth(depth);
                this.auxLayers[layerKey] = layer;
                this[layerKey] = layer;
            }

            // 2. Configure dedicated isolated background camera with shader effect
            newCameraConfigs.push({
                name: `${layerKey}_Camera`,
                layer: layerKey,
                effect: cfg.effect || null,
                effectConfig: cfg.effectConfig || {},
                type: 'BACKGROUND',
                parallaxFactor: cfg.parallax ?? 1.0,
                includeUI: false
            });
        });

        // Filter out duplicate layer configs and prepend the new background camera configs
        const filteredExisting = this.cameraConfigs.filter(c => !newCameraConfigs.some(nc => nc.layer === c.layer));
        this.cameraConfigs = [...newCameraConfigs, ...filteredExisting];
    }


    create() {
        this.entities = [];
        this.entitiesMap.clear();
        this.inputManager = new InputManager(this);

        // Create isolated layers for post-processing
        this.backgroundLayer = this.add.layer().setName('BACKGROUND_LAYER').setDepth(50);
        this.playground = this.add.layer().setName('PLAYGROUND').setDepth(100);
        this.foregroundLayer = this.add.layer().setName('FOREGROUND_LAYER').setDepth(200);
        this.uiLayer = this.add.layer().setName('UI_LAYER').setDepth(2000);
        this.webLayer = this.add.layer().setName('WEB_LAYER').setDepth(1100);
        this.debug_camera = this.add.layer().setName('DEBUG_CAMERA_LAYER').setDepth(5000);

        this.cameraConfigs = [
            { name: 'UICamera', layer: 'uiLayer', type: 'UI' },
            { name: 'DebugCamera', layer: 'debug_camera', type: 'FOREGROUND' }
        ];

        // Dedicated Camera for Web Layer
        this.webCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height).setName('WEB_CAMERA');
        
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
        
        // Clear custom camera/layer properties to prevent issues on re-entry
        this.auxCameras = {};
        this.auxLayers = {};
        this.currentBackground = null;
        this.backgroundColor = undefined;
        this.atmosphereColor = undefined;

        this._camInitialized = false;
        if (this.recIndicator) {
            this.recIndicator.destroy();
            this.recIndicator = null;
        }
    }

    update(time, delta) {
        if (!this.sys.isActive()) return;

        // --- FIRST FRAME INITIALIZATION ---
        if (!this.initialized) {
            const cam = this.cameras.main;
            
            // Use camera bounds if available, otherwise fallback to a large default
            const worldBounds = cam.useBounds ? cam._bounds : { x: -5000, y: -10000, width: 10000, height: 10000 };
            const minX = worldBounds.x;
            const maxX = worldBounds.x + worldBounds.width;
            const minY = worldBounds.y;
            const maxY = worldBounds.y + worldBounds.height;

            if (this.hasBoundaries) {
                if (!this.textures.exists('bg_grid')) {
                    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
                    gfx.lineStyle(2, 0x1a1a1a, 1);
                    gfx.strokeRect(0, 0, 100, 100);
                    gfx.generateTexture('bg_grid', 100, 100);
                    gfx.destroy();
                }
                const grid = this.add.tileSprite(
                    minX + worldBounds.width / 2, 
                    minY + worldBounds.height / 2, 
                    worldBounds.width, 
                    worldBounds.height, 
                    'bg_grid'
                ).setDepth(0);

                if (this.backgroundLayer) this.backgroundLayer.add(grid);
                if (this.webCamera) this.webCamera.ignore(grid);
            }

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
            if (this.hasBoundaries) {
                const glowGfx = this.add.graphics();
                if (this.playground) this.playground.add(glowGfx);
                
                for (let i = 1; i <= 8; i++) {
                    glowGfx.lineStyle(i * 8, 0x0088ff, 0.4 / i);
                    glowGfx.lineBetween(minX, maxY, maxX, maxY); // Floor
                    glowGfx.lineBetween(minX, minY, minX, maxY); // Left Wall
                    glowGfx.lineBetween(maxX, minY, maxX, maxY); // Right Wall
                }
                glowGfx.setDepth(1000); // High depth within the layer
                if (this.webCamera) this.webCamera.ignore(glowGfx);
            }

            this.initialized = true;
        }

        this.inputManager.update();
        RecordingSystem(this, this.inputManager);

        // Clamp delta to prevent death spiral upon scene switch or frame drop
        const clampedDelta = Math.min(delta, 100);
        this.accumulator += clampedDelta;

        let steps = 0;
        const maxSteps = 6;
        while (this.accumulator >= PHYSICS.STEP && steps < maxSteps) {
            const dtSeconds = PHYSICS.STEP / 1000;

            SlingshotSystem(this.entities, this.inputManager);
            WebSystem(this.entities, this.inputManager, this);
            EnergySystem(this.entities, dtSeconds, this);
            BugAISystem(this.entities, dtSeconds);
            AttachmentSystem(this.entities, this);
            TargetSystem(this.entities, this);
            EffectSystem(this.entities, dtSeconds);
            PathSystem(this.entities, dtSeconds, this);
            DriftSystem(this.entities, dtSeconds, this);
            MovementSystem(this.entities, this.inputManager, dtSeconds);
            PhysicsSystem(this.entities, PHYSICS.STEP, this);
            LifecycleSystem(this.entities, dtSeconds, this);

            this.fixedUpdate(time, PHYSICS.STEP);
            this.accumulator -= PHYSICS.STEP;
            steps++;
        }
        if (steps >= maxSteps) {
            this.accumulator = 0;
        }

        this.entities = this.entities.filter(e => {
            if (e.toDestroy) {
                const renderable = e.components.Renderable;
                if (renderable && renderable.activeVisuals) {
                    Object.values(renderable.activeVisuals).forEach(v => v.destroy());
                }
                this.entitiesMap.delete(e.id);
                return false;
            }
            return true;
        });

        const alpha = this.accumulator / PHYSICS.STEP;

        CameraSystem(this.entities, this, this.inputManager, alpha);
        
        // Sync Web Camera to Main Camera
        if (this.webCamera) {
            this.webCamera.scrollX = this.cameras.main.scrollX;
            this.webCamera.scrollY = this.cameras.main.scrollY;
            this.webCamera.zoom = this.cameras.main.zoom;
            this.webCamera.rotation = this.cameras.main.rotation;
        }

        ZLayerSystem(this.entities);

        RenderSystem(this.entities, this, alpha);
        ParallaxSystem(this.entities, this, alpha);
        
        SlingshotRenderSystem(this.entities, this, alpha);
        WebRenderSystem(this.entities, this, delta, alpha);

        this.renderDebugPath();
        this.updateDebugUI();
    }

    renderDebugPath() {
        // Circle & line distance-from-center indicator disabled
        if (this._debugGfx) {
            this._debugGfx.clear();
        }
    }

    fixedUpdate(time, dt) { }

    updateDebugUI() {
        const player = this.entities.find(e => e.components.PlayerTag);
        
        // Debug Camera Info
        const cameraInfo = this.cameras.cameras.map(c => {
            const baseType = c.auxType || (c === this.cameras.main ? 'PLAY' : (c === this.webCamera ? 'FOREGROUND' : '?'));
            const isRenderingUI = c.renderedLayers && c.renderedLayers.includes('UI');
            // If it's a dedicated UI camera, just call it UI. 
            // If it's another camera rendering UI, call it TYPE+UI.
            const typeStr = (isRenderingUI && baseType !== 'UI') ? `${baseType}+UI` : baseType;
            
            const layers = (c.renderedLayers || []).join('+') || '?';
            const parallax = c.parallaxFactor !== undefined ? ` (P:${c.parallaxFactor.toFixed(1)})` : '';
            const effects = c.postPipelines.map(p => p.constructor.name).join(', ') || 'Normal';
            return `<span style="color:#0f0">[${typeStr}]</span> <span style="color:#fff">${c.name}</span> <span style="color:#888;">→ ${layers}${parallax}</span><br> &nbsp;&nbsp; <span style="color:#aaa;">FX: ${effects}</span>`;
        });

        // Debug Energy Rules
        const activeRules = (this.energyRules || []).map(r => r.ruleName || 'Unknown');

        if (player) {
            const sling = player.components.SlingshotJump || {};
            const tether = player.components.WebTether || null;
            const rawStick = this.inputManager.getRightStickRaw();
            const cam = this.cameras.main;
            const worldBounds = cam.useBounds ? cam._bounds : { x: 0, y: 0, width: 0, height: 0 };

            UI.updateDebug({
                scene: this.scene.key,
                x: Math.round(player.components.Position.x),
                y: Math.round(player.components.Position.y)
            }, {
                fps: Math.round(this.game.loop.actualFps),
                status: player.components.Parent ? "ATTACHED" : "FREE",
                memory: player.components.PlayerMemory?.entities.length || 0,
                background: this.currentBackground || 'Default',
                worldDims: `${Math.round(worldBounds.width)}x${Math.round(worldBounds.height)}`,
                bgDims: this.bgDimensions ? `${this.bgDimensions.w}x${this.bgDimensions.h}` : 'Auto',
                entityCount: this.entities.length,
                cameras: cameraInfo,
                energyRules: activeRules,
                sling: {
                    isCharging: sling.isCharging,
                    rawStick: rawStick,
                    vecX: sling.vector ? sling.vector.x : 0,
                    vecY: sling.vector ? sling.vector.y : 0
                },
                web: tether ? {
                    length: Math.round(tether.currentLength),
                    maxLength: Math.round(tether.maxLength)
                } : null
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
        this.entitiesMap.set(entity.id, entity);
        return entity;
    }

    getEntityById(id) {
        return this.entitiesMap.get(id);
    }
}
