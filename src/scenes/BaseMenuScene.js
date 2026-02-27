import Phaser from 'phaser';
import { InputManager } from '../core/Input';
import { loadBackground } from '../backgrounds/index';
import { RenderSystem, ParallaxSystem, CameraSystem, ZLayerSystem } from '../ecs/systems/index';
import { RecordingSystem } from '../ecs/systems/RecordingSystem';
import { PHYSICS } from '../core/Constants';
import { UI } from '../core/UIManager';

export class BaseMenuScene extends Phaser.Scene {
    constructor(key, title = 'MENU', subtitle = '') {
        super(key);
        this.title = title;
        this.subtitle = subtitle;
        this.options = [];
        this.selected = 0;
        this.textObjects = [];
        this.entities = [];
    }

    create() {
        this.inputManager = new InputManager(this);
        this.textObjects = [];
        this.selected = 0;
        this.entities = [];
        this.menuCamX = 0;
        this.menuCamY = 0;
        this.auxCameras = {};
        this.auxLayers = {};

        // Initialize base layers for RenderSystem
        this.backgroundLayer = this.add.layer().setName('BACKGROUND_LAYER').setDepth(50);
        this.playLayer = this.add.layer().setName('PLAY_LAYER').setDepth(100);
        this.foregroundLayer = this.add.layer().setName('FOREGROUND_LAYER').setDepth(200);
        this.uiLayer = this.add.layer().setName('UI_LAYER').setDepth(2000);

        // Match visual style of gameplay scenes
        this.cameras.main.setZoom(0.8);
        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.centerOn(0, 0);

        // Define dynamic camera configuration
        this.cameraConfigs = [
            { name: 'BackgroundWC', layer: 'bg_watercolor', effect: 'watercolor', type: 'BACKGROUND' },
            { name: 'BackgroundOldGlass', layer: 'bg_glass', effect: 'old_glass', type: 'BACKGROUND' },
            { name: 'ForegroundBW', layer: 'fg_grayscale', effect: 'grayscale', type: 'PLAY' }
        ];

        // --- RANDOM BACKGROUND ---
        const backgrounds = ['cathedral', 'cathedral_pink_blue', 'rainbow_cathedral', 'stained_rainbow', 'complexity', 'complexity2'];
        const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        
        // Pass the custom layer name to the background loader if it supports it
        const layerName = randomBg === 'stained_rainbow' ? 'bg_glass' : 'bg_watercolor';
        
        loadBackground(randomBg, this, { 
            worldWidth: 4000, 
            worldHeight: 8000, // Give menu scenes a consistent large height
            layerName: layerName 
        });

        this.setupHeader();
        this.setupMenu();
        this.updateSelection();

        this.input.keyboard.on('keydown-TAB', () => {
            UI.toggleDebug();
        });

        // Dedicated ESC listener for reliability
        this.input.keyboard.on('keydown-ESC', () => this.handleBack());
    }

    setupHeader() {
        // Calculate overlay width based on title text
        const overlayWidth = 450; // Use a fixed width for consistency
        const overlayHeight = this.cameras.main.height * 2;

        // Add a dark overlay so text is readable over background
        const overlay = this.add.rectangle(0, 0, overlayWidth, overlayHeight, 0x000000, 0.85)
            .setOrigin(0, 0)
            .setScrollFactor(0);
        this.playLayer.add(overlay);

        const titleText = this.add.text(50, 50, this.title, {
            fontSize: '64px',
            fill: '#fff',
            fontFamily: 'monospace'
        }).setScrollFactor(0);
        this.playLayer.add(titleText);

        if (this.subtitle) {
            const sub = this.add.text(55, 130, this.subtitle, {
                fontSize: '24px',
                fill: '#0ff',
                fontFamily: 'monospace'
            }).setScrollFactor(0);
            this.playLayer.add(sub);
        }
    }

    setupMenu() {
        const startY = 250;
        const spacing = 50;

        this.options.forEach((opt, index) => {
            const label = typeof opt === 'string' ? opt : opt.label;
            const text = this.add.text(60, startY + (index * spacing), `  ${label}`, {
                fontSize: '24px',
                fill: '#fff',
                fontFamily: 'monospace'
            }).setScrollFactor(0);
            this.playLayer.add(text);
            this.textObjects.push(text);
        });
    }

    update(time, delta) {
        this.inputManager.update();
        RecordingSystem(this, this.inputManager);

        if (this.inputManager.getAction('UP')) {
            this.navigate(-1);
        }
        else if (this.inputManager.getAction('DOWN')) {
            this.navigate(1);
        }

        if (this.inputManager.getAction('SELECT')) {
            this.handleSelection();
        }

        if (this.inputManager.getAction('BACK')) {
            this.handleBack();
        }

        // --- MENU CAMERA (Stick Controlled) ---
        const stick = this.inputManager.getRightStick();
        const maxOffset = 150;
        const targetX = stick.x * maxOffset;
        const targetY = stick.y * maxOffset;
        
        // Lerp camera center towards target for smoothness
        const lerp = 0.05;
        this.menuCamX += (targetX - this.menuCamX) * lerp;
        this.menuCamY += (targetY - this.menuCamY) * lerp;
        this.cameras.main.centerOn(this.menuCamX, this.menuCamY);

        // --- BACKGROUND RENDERING ---
        CameraSystem(this.entities, this, null, 1.0); 
        ZLayerSystem(this.entities);
        RenderSystem(this.entities, this, 1.0);
        ParallaxSystem(this.entities, this, 1.0);

        this.updateDebugUI();
    }

    updateDebugUI() {
        // Debug Camera Info
        const cameraInfo = this.cameras.cameras.map(c => {
            return `${c.name} (${c.postPipelines.map(p => p.constructor.name).join(', ') || 'Normal'})`;
        });

        const cam = this.cameras.main;
        const worldBounds = cam.useBounds ? cam._bounds : { x: 0, y: 0, width: 0, height: 0 };

        UI.updateDebug({
            scene: this.scene.key,
            x: Math.round(this.menuCamX),
            y: Math.round(this.menuCamY)
        }, {
            fps: Math.round(this.game.loop.actualFps),
            status: "MENU",
            background: this.currentBackground || 'Default',
            worldDims: `${Math.round(worldBounds.width)}x${Math.round(worldBounds.height)}`,
            bgDims: this.bgDimensions ? `${this.bgDimensions.w}x${this.bgDimensions.h}` : 'Auto',
            cameras: cameraInfo
        });
    }

    navigate(dir) {
        const count = this.options.length;
        if (count === 0) return;
        this.selected = (this.selected + dir + count) % count;
        this.updateSelection();
    }

    updateSelection() {
        this.textObjects.forEach((text, index) => {
            if (!text || !text.active) return;
            
            const label = typeof this.options[index] === 'string' 
                ? this.options[index] 
                : this.options[index].label;

            if (index === this.selected) {
                text.setColor('#ff69b4').setText(`> ${label}`); // Hot Pink
            } else {
                text.setColor('#fff').setText(`  ${label}`);
            }
        });
    }

    handleSelection() {
        // To be implemented by subclasses
    }

    handleBack() {
        // Optional back button behavior
    }

    addEntity(componentsArray) {
        const entity = {
            id: crypto.randomUUID(),
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
