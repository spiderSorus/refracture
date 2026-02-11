const { createWorld, addEntity, addComponent } = require('bitecs');
const { Position, Velocity, Graphic, Input, CameraTarget, Platform } = require('../../ecs/components');
const { UNIT_SIZE } = require('../../constants');

// Factories
const createPlayer = require('../../ecs/entities/player');

// Systems
const createInputSystem = require('../../ecs/systems/input');
const createMovementSystem = require('../../ecs/systems/movement');
const createRenderSystem = require('../../ecs/systems/render');
const createCameraSystem = require('../../ecs/systems/camera');
const createPlatformSystem = require('../../ecs/systems/platform'); // <--- New System

module.exports = class PlatformTest {
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;
        this.world = createWorld();
        this.state = { debug: true };
    }

    async init() {
        console.log("SCENE: Platform Test");

        // Init Systems
        this.inputSystem = createInputSystem();
        this.movementSystem = createMovementSystem(); // Handling Player Input Movement
        this.platformSystem = createPlatformSystem(); // Handling Platform Logic
        this.cameraSystem = createCameraSystem(this.app);
        this.renderSystem = createRenderSystem(this.app, this.state);

        // 1. Create Player
        const player = createPlayer(this.world, 0, 0);
        addComponent(this.world, CameraTarget, player);

        // 2. Create Moving Platform
        this.createPlatform(0, 0, 100, 40, 50, 0); // X, Y, W, H, VelX, VelY



        // Exit Handler
        this._onExit = (e) => {
            if (e.code === 'Backspace') {
                const MenuScene = require('../MenuScene');
                this.manager.loadScene(MenuScene);
            }
        };
        window.addEventListener('keydown', this._onExit);
    }

    createPlatform(x, y, w, h, vx, vy) {
        const eid = addEntity(this.world);
        addComponent(this.world, Position, eid);
        addComponent(this.world, Velocity, eid);
        addComponent(this.world, Platform, eid); // Tag it as a platform
        addComponent(this.world, Graphic, eid);
        Graphic.controllerId[eid] = 2; // Matches the key in 'controllers' map above

        Position.x[eid] = x;
        Position.y[eid] = y;
        Velocity.x[eid] = vx;
        Velocity.y[eid] = vy;

        Platform.width[eid] = w;
        Platform.height[eid] = h;

        // Visuals
        Graphic.shape[eid] = 1; // Rect
        Graphic.color[eid] = 0x808080; // Gray
        Graphic.size[eid] = w / 10; // NOTE: Our RenderSystem uses size for both W and H (Square).
        // To support rectangles properly, we might need to tweak RenderSystem later.
        // For now, it will draw a Square based on size.
    }

    update() {
        const ms = this.app.ticker.elapsedMS;
        const dt = ms / 1000;

        this.inputSystem(this.world);

        // 1. Player moves themselves (Input)
        this.movementSystem(this.world, ms);

        // 2. Platform moves itself AND carries Player
        this.platformSystem(this.world, dt);

        this.cameraSystem(this.world);
        this.renderSystem(this.world);
    }

    destroy() {
        window.removeEventListener('keydown', this._onExit);
        this.app.stage.removeChildren();
    }
};