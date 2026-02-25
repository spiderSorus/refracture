import Phaser from 'phaser';
import { InputManager } from '../core/Input';
import { loadBackground } from '../backgrounds/index';
import { RenderSystem, ParallaxSystem, CameraSystem, ZLayerSystem } from '../ecs/systems/index';
import { PHYSICS } from '../core/Constants';

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

        // Match visual style of gameplay scenes
        this.cameras.main.setZoom(0.8);
        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.centerOn(0, 0);

        // Initialize Scene Layers
        this.bgLayer = this.add.layer().setName('BG_LAYER').setDepth(50);
        this.fgLayer = this.add.layer().setName('FG_LAYER').setDepth(100);
        this.foreLayer = this.add.layer().setName('FORE_LAYER').setDepth(200);

        // Apply background effects
        if (this.bgLayer) {
            this.bgLayer.setPostPipeline('AquarellePipeline');
        }

        // --- RANDOM BACKGROUND ---
        const backgrounds = ['cathedral', 'cathedral_pink_blue', 'rainbow_cathedral'];
        const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        loadBackground(randomBg, this, { worldSize: 4000 });

        this.setupHeader();
        this.setupMenu();
        this.updateSelection();
    }

    setupHeader() {
        const titleText = this.add.text(50, 50, this.title, {
            fontSize: '64px',
            fill: '#fff',
            fontFamily: 'monospace'
        }).setScrollFactor(0).setDepth(10);

        // Calculate overlay width based on title text
        const overlayWidth = titleText.width + 100;
        const overlayHeight = this.cameras.main.height * 2;

        // Add a dark overlay so text is readable over background
        // Fixed to screen, width matched to text
        this.add.rectangle(0, 0, overlayWidth, overlayHeight, 0x000000, 0.5)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(5);

        if (this.subtitle) {
            this.add.text(55, 130, this.subtitle, {
                fontSize: '24px',
                fill: '#0ff',
                fontFamily: 'monospace'
            }).setScrollFactor(0).setDepth(10);
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
            }).setScrollFactor(0).setDepth(10);
            this.textObjects.push(text);
        });
    }

    update(time, delta) {
        this.inputManager.update();

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
        // Minimal ECS loop for background visuals
        CameraSystem(this.entities, this, null, 1.0); // No input manager for menu camera logic
        ZLayerSystem(this.entities);
        RenderSystem(this.entities, this, 1.0);
        ParallaxSystem(this.entities, this, 1.0);

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
