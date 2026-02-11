const PIXI = require('pixi.js');
const { createWorld } = require('bitecs');
const createPlayer = require('./ecs/entities/player');
const createRenderSystem = require('./ecs/systems/render');
const createMovementSystem = require('./ecs/systems/movement');
const createInputSystem = require('./ecs/systems/input');

async function initGame(app) {
    const world = createWorld();

    // Systems
    const renderSystem = createRenderSystem(app);
    const movementSystem = createMovementSystem();

    // Create player and get Input System for that specific EID
    const playerEid = createPlayer(world, app.screen.width / 2, app.screen.height / 2);
    const inputSystem = createInputSystem(playerEid);

    app.ticker.add((ticker) => {
        inputSystem();
        movementSystem(world, ticker.deltaTime);
        renderSystem(world);
    });
}

module.exports = { initGame };