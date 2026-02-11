const { createWorld, addComponent } = require('bitecs');
const { CameraTarget } = require('../../ecs/components');

// Import Factories
const createPlayer = require('../../ecs/entities/player');
const createTarget = require('../../ecs/entities/target');

// Import Systems
const createInputSystem = require('../../ecs/systems/input');
const createMovementSystem = require('../../ecs/systems/movement');
const createRenderSystem = require('../../ecs/systems/render');
const createCameraSystem = require('../../ecs/systems/camera');
const createKeyboardSystem = require('../../ecs/systems/keyboard');

module.exports = class MovementTest {
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;

        // Scene-specific World & State
        this.world = createWorld();
        this.state = { debug: true }; // Default to debug ON so you can see the HUD
    }

    async init() {
        console.log("SCENE: Initializing Movement Test (OG Setup)...");

        // 1. Initialize Systems
        this.keyboardSystem = createKeyboardSystem();
        this.inputSystem = createInputSystem();
        this.movementSystem = createMovementSystem();
        this.cameraSystem = createCameraSystem(this.app);
        this.renderSystem = createRenderSystem(this.app, this.state);

        // 2. Spawn Entities
        // Player at World Origin (0,0)
        const playerEid = createPlayer(this.world, 0, 0);
        addComponent(this.world, CameraTarget, playerEid);

        // Target at (1000, 0)
        createTarget(this.world, 100, 0);

        // 3. Setup Exit Listener (Backspace to return to Menu)
        this._onKeyDown = (e) => {
            if (e.code === 'Backspace' || e.code === 'Escape') {
                // Dynamic require to avoid circular dependency
                const MenuScene = require('../MenuScene');
                this.manager.loadScene(MenuScene);
            }
        };
        window.addEventListener('keydown', this._onKeyDown);
    }

    update() {
        const ms = this.app.ticker.elapsedMS;

        // Run Systems in Order
        this.keyboardSystem(this.world, this.state);
        this.inputSystem(this.world);
        this.movementSystem(this.world, ms);
        this.cameraSystem(this.world);
        this.renderSystem(this.world);
    }

    destroy() {
        console.log("SCENE: Destroying Movement Test...");

        // Remove the Exit Listener
        window.removeEventListener('keydown', this._onKeyDown);

        // Cleanup Pixi Stage (Removes all graphics/UI)
        this.app.stage.removeChildren();
    }
};