const { createWorld, addComponent } = require('bitecs');
const { CameraTarget } = require('../ecs/components');
const createPlayer = require('../ecs/entities/player');
const createTarget = require('../ecs/entities/target');

// Systems
const createInputSystem = require('../ecs/systems/input');
const createMovementSystem = require('../ecs/systems/movement');
const createRenderSystem = require('../ecs/systems/render');
const createCameraSystem = require('../ecs/systems/camera');

module.exports = class GameScene {
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;
        this.world = createWorld();
        this.state = { debug: true }; // Start with debug on
    }

    async init() {
        console.log("GameScene: Entering Gameplay...");

        this.inputSystem = createInputSystem();
        this.movementSystem = createMovementSystem();
        this.cameraSystem = createCameraSystem(this.app);
        this.renderSystem = createRenderSystem(this.app, this.state);

        // Spawn Entities
        const playerEid = createPlayer(this.world, 0, 0);
        addComponent(this.world, CameraTarget, playerEid);
        createTarget(this.world, 1000, 0);
    }

    update() {
        const ms = this.app.ticker.elapsedMS;

        this.inputSystem(this.world);
        this.movementSystem(this.world, ms);
        this.cameraSystem(this.world);
        this.renderSystem(this.world);
    }

    destroy() {
        console.log("GameScene: Exiting...");
        this.app.stage.removeChildren();
    }
};