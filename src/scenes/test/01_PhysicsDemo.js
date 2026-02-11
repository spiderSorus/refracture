const { createWorld, addEntity, addComponent } = require('bitecs');
const { Position, Velocity, Graphic, Mass, CameraTarget } = require('../../ecs/components');
const { UNIT_SIZE } = require('../../constants');

// Systems
const createRenderSystem = require('../../ecs/systems/render');
const createCameraSystem = require('../../ecs/systems/camera');
const createGravitySystem = require('../../ecs/systems/gravity');
const createMovementSystem = require('../../ecs/systems/movement');

module.exports = class PhysicsDemo {
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;
        this.world = createWorld();
        this.state = { debug: true };
    }

    async init() {
        console.log("SCENE: Orbit Simulation Initialized");

        // --- Init Systems ---
        this.movementSystem = createMovementSystem();
        this.gravitySystem = createGravitySystem();
        this.cameraSystem = createCameraSystem(this.app);
        this.renderSystem = createRenderSystem(this.app, this.state);

        // --- Create SUN (Heavy, Stationary) ---
        const sun = addEntity(this.world);
        addComponent(this.world, Position, sun);
        addComponent(this.world, Velocity, sun);
        addComponent(this.world, Mass, sun);
        addComponent(this.world, Graphic, sun);
        addComponent(this.world, CameraTarget, sun);

        Position.x[sun] = 0;
        Position.y[sun] = 0;
        Mass.value[sun] = 1000; // Heavy!
        Graphic.shape[sun] = 0; // Circle
        Graphic.color[sun] = 0xFFD700; // Gold
        Graphic.size[sun] = 40;

        // --- Create EARTH (Light, Moving) ---
        const earth = addEntity(this.world);
        addComponent(this.world, Position, earth);
        addComponent(this.world, Velocity, earth);
        addComponent(this.world, Mass, earth);
        addComponent(this.world, Graphic, earth);
        addComponent(this.world, CameraTarget, earth);

        const orbitRadius = 200;
        Position.x[earth] = orbitRadius;
        Position.y[earth] = 0;
        Mass.value[earth] = 10;

        // Orbital Velocity Calculation: v = sqrt(G * M_sun / r)
        // G=500, M=1000, r=200 -> v = sqrt(500 * 1000 / 200) = sqrt(2500) = 50
        Velocity.x[earth] = 0;
        Velocity.y[earth] = 50;

        Graphic.shape[earth] = 0;
        Graphic.color[earth] = 0x0099FF; // Blue
        Graphic.size[earth] = 10;

        // --- Exit Handler ---
        this._onExit = (e) => {
            if (e.code === 'Backspace' || e.code === 'Escape') {
                const MenuScene = require('../MenuScene');
                this.manager.loadScene(MenuScene);
            }
        };
        window.addEventListener('keydown', this._onExit);
    }

    update() {
        const ms = this.app.ticker.elapsedMS;
        const dt = ms / 1000;

        // 1. Calculate Forces
        this.gravitySystem(this.world, dt);

        // 2. Apply Movement
        this.movementSystem(this.world, ms);

        // 3. Render
        this.cameraSystem(this.world);
        this.renderSystem(this.world);
    }

    destroy() {
        window.removeEventListener('keydown', this._onExit);
        this.app.stage.removeChildren();
    }
};