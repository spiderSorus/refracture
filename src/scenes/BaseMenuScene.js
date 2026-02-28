import Phaser from 'phaser';
import { InputManager } from '../core/Input';
import { loadBackground } from '../backgrounds/index';
import { RenderSystem, ParallaxSystem, CameraSystem, ZLayerSystem } from '../ecs/systems/index';
import { RecordingSystem } from '../ecs/systems/RecordingSystem';
import { PHYSICS } from '../core/Constants';
import { UI } from '../core/UIManager';
import { Position, Renderable, ZLayer, Rotation, Parallax } from '../ecs/components/index';

export class BaseMenuScene extends Phaser.Scene {
    constructor(key, title = 'MENU', subtitle = '') {
        super(key);
        this.title = title;
        this.subtitle = subtitle;
        this.options = [];
        this.selected = 0;
        this.textObjects = [];
        this.menuEntities = [];
        this.entities = [];
    }

    create() {
        this.inputManager = new InputManager(this);
        this.textObjects = [];
        this.menuEntities = [];
        this.selected = 0;
        this.entities = [];
        this.menuCamX = 0;
        this.menuCamY = 0;
        this.scrollOffsetTargetY = 0;
        this.scrollOffsetCurrentY = 0;
        this.auxCameras = {};
        this.auxLayers = {};

        // Initialize base layers for RenderSystem
        this.backgroundLayer = this.add.layer().setName('BACKGROUND_LAYER').setDepth(50);
        this.uibgLayer = this.add.layer().setName('UIBG_LAYER').setDepth(1500);
        this.playground = this.add.layer().setName('PLAYGROUND').setDepth(100);
        this.foregroundLayer = this.add.layer().setName('FOREGROUND_LAYER').setDepth(200);
        this.uiLayer = this.add.layer().setName('UI_LAYER').setDepth(2000);

        // Match visual style of gameplay scenes
        const WORLD_SIZE = 5000;
        this.cameras.main.setBounds(-WORLD_SIZE / 2, -WORLD_SIZE / 2, WORLD_SIZE, WORLD_SIZE);
        this.cameras.main.setZoom(0.8);
        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.centerOn(0, 0);

        // --- BACKGROUND ---
        const backgrounds = ['watercolor', 'red_cathedral', 'rainbow_cathedral', 'complexity'];
        const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        
        this.cameraConfigs = [
            { name: 'UICamera', layer: 'uiLayer', type: 'UI' },
            { name: 'UIBGCamera', layer: 'uibgLayer', type: 'UIBG' }
        ];

        loadBackground(randomBg, this);

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
        this.uiLayer.add(overlay);

        const titleText = this.add.text(50, 50, this.title, {
            fontSize: '64px',
            fill: '#fff',
            fontFamily: 'monospace'
        }).setScrollFactor(0);
        this.uiLayer.add(titleText);

        // Background watercolor title
        this.addEntity([
            Position(50, 50),
            Rotation(0),
            ZLayer('UIBG', 10),
            Parallax(0),
            Renderable({
                'BG': {
                    type: 'watercolor_text',
                    text: this.title,
                    style: { fontSize: '64px', fontFamily: 'monospace' },
                    color: 0x4488ff,
                    layers: 6
                }
            })
        ]);

        if (this.subtitle) {
            const sub = this.add.text(55, 130, this.subtitle, {
                fontSize: '24px',
                fill: '#0ff',
                fontFamily: 'monospace'
            }).setScrollFactor(0);
            this.uiLayer.add(sub);
        }
    }

    setupMenu() {
        this.options.forEach((opt, index) => {
            const label = typeof opt === 'string' ? opt : opt.label;
            const text = this.add.text(60, 0, `  ${label}`, {
                fontSize: '24px',
                fill: '#fff',
                fontFamily: 'monospace'
            }).setScrollFactor(0);
            this.uiLayer.add(text);
            this.textObjects.push(text);

            // Create background entity for this menu item
            const bgEntity = this.addEntity([
                Position(60, 0),
                Rotation(0),
                ZLayer('UIBG', 10),
                Parallax(0),
                Renderable({
                    'BG': {
                        type: 'watercolor_text',
                        text: `  ${label}`,
                        style: { fontSize: '24px', fontFamily: 'monospace' },
                        color: 0xffffff,
                        layers: 4
                    }
                })
            ]);
            this.menuEntities.push(bgEntity);
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

        // --- MENU CAMERA (Stick + Scroll Controlled) ---
        const stick = this.inputManager.getRightStick();
        const maxOffset = 150;
        
        const targetX = stick.x * maxOffset;
        const targetY = (stick.y * maxOffset) + this.scrollOffsetTargetY;
        
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
            const baseType = c.auxType || (c === this.cameras.main ? 'PLAY' : '?');
            const isRenderingUI = c.renderedLayers && c.renderedLayers.includes('UI');
            const typeStr = (isRenderingUI && baseType !== 'UI') ? `${baseType}+UI` : baseType;
            
            const layers = (c.renderedLayers || []).join('+') || '?';
            const parallax = c.parallaxFactor !== undefined ? ` (P:${c.parallaxFactor.toFixed(1)})` : '';
            const effects = c.postPipelines.map(p => p.constructor.name).join(', ') || 'Normal';
            return `<span style="color:#0f0">[${typeStr}]</span> <span style="color:#fff">${c.name}</span> <span style="color:#888;">→ ${layers}${parallax}</span><br> &nbsp;&nbsp; <span style="color:#aaa;">FX: ${effects}</span>`;
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
            entityCount: this.entities.length,
            cameras: cameraInfo
        });
    }

    navigate(dir) {
        const count = this.options.length;
        if (count <= 1) return;
        
        let nextIndex = (this.selected + dir + count) % count;
        
        // Skip separators
        if (this.options[nextIndex]?.isSeparator) {
            nextIndex = (nextIndex + dir + count) % count;
        }

        this.selected = nextIndex;
        
        // Background Camera Movement: Shift target Y based on selection
        // We'll move the camera about 100 units per item index
        this.scrollOffsetTargetY = (this.selected - (count / 2)) * 100;

        this.updateSelection();
    }

    updateSelection() {
        const count = this.options.length;
        if (count === 0) return;

        const centerY = 450;
        const spacing = 60;
        const visibleRange = 5; // How many items above and below to show

        this.textObjects.forEach((text, index) => {
            const bgEntity = this.menuEntities[index];
            
            // Calculate distance from selection in a circular way
            let diff = index - this.selected;
            
            // Adjust diff for ring buffer wrap-around
            if (diff > count / 2) diff -= count;
            if (diff < -count / 2) diff += count;

            if (Math.abs(diff) > visibleRange) {
                text.setVisible(false);
                if (bgEntity) bgEntity.components.Renderable.definitions.BG.visible = false;
                return;
            }

            text.setVisible(true);
            if (bgEntity) bgEntity.components.Renderable.definitions.BG.visible = true;
            
            const targetY = centerY + (diff * spacing);
            
            // Simple lerp-like positioning or immediate for now
            text.setY(targetY);

            const label = typeof this.options[index] === 'string' 
                ? this.options[index] 
                : this.options[index].label;

            // Visual effects based on distance from center
            const dist = Math.abs(diff);
            const alpha = 1.0 - (dist * 0.2);
            const scale = 1.0 - (dist * 0.1);

            text.setAlpha(Math.max(0, alpha));
            text.setScale(Math.max(0.5, scale));

            const isSeparator = this.options[index]?.isSeparator;
            let currentLabel = `  ${label}`;
            let fontSize = '24px';
            let color = 0xffffff;

            if (index === this.selected) {
                if (isSeparator) {
                    text.setColor('#888').setText(`  ${label}`);
                    color = 0x888888;
                } else {
                    text.setColor('#ff69b4').setText(`> ${label}`); // Hot Pink
                    currentLabel = `> ${label}`;
                    color = 0xff69b4;
                }
                text.setFontSize('32px');
                fontSize = '32px';
                text.setX(80);
            } else {
                text.setColor('#fff').setText(`  ${label}`);
                text.setFontSize('24px');
                text.setX(60);
            }

            // Update background entity position and style
            if (bgEntity) {
                // Use screen coordinates directly since UIBG layer is screen-aligned
                bgEntity.components.Position.x = text.x;
                bgEntity.components.Position.y = text.y;
                
                const bgDef = bgEntity.components.Renderable.definitions.BG;
                bgDef.text = currentLabel;
                bgDef.style.fontSize = fontSize;
                bgDef.color = color;
                bgDef.alpha = alpha * 0.5; // Slightly fainter for background
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
