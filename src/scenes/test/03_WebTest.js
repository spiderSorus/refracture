const { createWorld, addEntity, addComponent } = require('bitecs');
const { Position, Velocity, Graphic, Mass, CameraTarget, Platform } = require('../../ecs/components');

// Systems
const createRenderSystem = require('../../ecs/systems/render');
const createCameraSystem = require('../../ecs/systems/camera');
const createGravitySystem = require('../../ecs/systems/gravity');
const createMovementSystem = require('../../ecs/systems/movement');
const createPlatformSystem = require('../../ecs/systems/platform');
const createInputSystem = require('../../ecs/systems/input');

// Factories
const createPlayer = require('../../ecs/entities/player');

module.exports = class WebTest {
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;
        this.world = createWorld();
        this.state = { debug: true };
    }

    async init() {
        console.log("SCENE: Web Test - Baseline Orbit");

        this.inputSystem = createInputSystem();
        this.movementSystem = createMovementSystem();
        this.gravitySystem = createGravitySystem();
        this.platformSystem = createPlatformSystem();
        this.cameraSystem = createCameraSystem(this.app);
        this.renderSystem = createRenderSystem(this.app, this.state);

        // 1. CENTER PLATFORM (The Sun)
        // Static, massive, at (0,0)
        const sun = this.createPlatformEntity(0, 0, 60, 60, 0xFFCC00);
        Mass.value[sun] = 2500;

        // 2. ORBITING PLATFORM (The Planet)
        // 400 units away on the X axis
        const planet = this.createPlatformEntity(400, 0, 40, 40, 0x00FFCC);
        Mass.value[planet] = 10;

        // Orbital Velocity calculation: v = sqrt(G * M / r)
        // v = sqrt(500 * 2500 / 400) = sqrt(3125) ≈ 56
        Velocity.y[planet] = 56;

        // 3. THE PLAYER
        // We spawn them exactly where the planet is
        const player = createPlayer(this.world, 400, 0);

        // Make the camera track BOTH the sun and the player for a nice wide view
        addComponent(this.world, CameraTarget, player);
        addComponent(this.world, CameraTarget, sun);

        this._onExit = (e) => {
            if (e.code === 'Backspace') {
                const MenuScene = require('../MenuScene');
                this.manager.loadScene(MenuScene);
            }
        };
        window.addEventListener('keydown', this._onExit);
    }

    createPlatformEntity(x, y, w, h, color) {
        const eid = addEntity(this.world);
        addComponent(this.world, Position, eid);
        addComponent(this.world, Velocity, eid);
        addComponent(this.world, Mass, eid);
        addComponent(this.world, Platform, eid);
        addComponent(this.world, Graphic, eid);

        Position.x[eid] = x;
        Position.y[eid] = y;
        Platform.width[eid] = w;
        Platform.height[eid] = h;

        Graphic.controllerId[eid] = 2; // Uses src/graphics/platform.js
        Graphic.color[eid] = color;

        return eid;
    }

    update() {
        const ms = this.app.ticker.elapsedMS;
        const dt = ms / 1000;

        // Sequence is vital:
        this.inputSystem(this.world);
        this.gravitySystem(this.world, dt);    // Calculate orbital pull
        this.movementSystem(this.world, ms);   // Move entities by velocity
        this.platformSystem(this.world, dt);   // Attach player and apply "sticky" movement
        this.cameraSystem(this.world);
        this.renderSystem(this.world);
    }

    destroy() {
        window.removeEventListener('keydown', this._onExit);
        this.app.stage.removeChildren();
    }
};