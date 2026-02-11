const PIXI = require('pixi.js');
const { createWorld, addComponent } = require('bitecs');

// Import Constants
const { PPU } = require('./constants');

// Import ECS Components
const { Position, CameraTarget, Debug } = require('./ecs/components');

// Import Entity Factories
const createPlayer = require('./ecs/entities/player');
const createTarget = require('./ecs/entities/target'); // New target factory

// Import Systems
const createInputSystem = require('./ecs/systems/input');
const createMovementSystem = require('./ecs/systems/movement');
const createRenderSystem = require('./ecs/systems/render');
const createCameraSystem = require('./ecs/systems/camera');

/**
 * Main entry point for the Refract application logic.
 * @param {PIXI.Application} app - The PixiJS instance from index.html
 */
async function initGame(app) {
    console.log("Refract: Initializing Engine...");

    // 1. Initialize the ECS World
    const world = createWorld();

    // 2. Global App State (for Debug Toggles)
    const state = { debug: true };

    // 3. Instantiate Systems
    const inputSystem = createInputSystem();
    const movementSystem = createMovementSystem();
    const cameraSystem = createCameraSystem(app);
    const renderSystem = createRenderSystem(app, state);

    // 4. Initialize Player in Units
    const startX = (app.screen.width / 2) / PPU;
    const startY = (app.screen.height / 2) / PPU;

    const playerEid = createPlayer(world, startX, startY);
    addComponent(world, CameraTarget, playerEid);

    // 5. Initialize Red Square Target (1000 units away)
    // This will cause the camera system to zoom out to frame both entities.
    createTarget(world, startX + 1000, startY);

    // 6. Global Input Listeners
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Tab') {
            e.preventDefault();
            state.debug = !state.debug;
            console.log("Debug Mode:", state.debug ? "ON" : "OFF");
        }
    });

    // 7. The Main Loop (Pixi Ticker)
    app.ticker.add(() => {
        const ms = app.ticker.elapsedMS;

        // --- Execute ECS Pipeline ---

        // Polls Gamepads -> Updates Velocity
        inputSystem(world);

        // Updates Position based on Velocity & Time
        movementSystem(world, ms);

        // Calculates Pivot/Zoom based on Player and Target
        cameraSystem(world);

        // Maps Units to Pixels & Draws everything
        renderSystem(world);

        // --- Optional: Bounds Check ---
        // Since the camera is following targets, we'll keep these 
        // simple so you don't fly infinitely into the void if you let go.
        const worldLimit = 2000;
        if (Position.x[playerEid] < -worldLimit) Position.x[playerEid] = worldLimit;
        if (Position.x[playerEid] > worldLimit) Position.x[playerEid] = -worldLimit;
    });
}

module.exports = { initGame };