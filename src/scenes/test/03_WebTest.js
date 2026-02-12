const { createWorld, addEntity, addComponent } = require('bitecs');
const { Position, Velocity, Graphic, CameraTarget, Platform, Keyboard, Web, Orbit, Patrol, WorldSpace, Parent } = require('../../ecs/components');

const createRenderSystem = require('../../ecs/systems/render');
const createCameraSystem = require('../../ecs/systems/camera');
const createMovementSystem = require('../../ecs/systems/movement');
const createPlatformSystem = require('../../ecs/systems/platform');
const createInputSystem = require('../../ecs/systems/input');
const createKeyboardSystem = require('../../ecs/systems/keyboard');
const createDebugSystem = require('../../ecs/systems/debug');
const createOrbitSystem = require('../../ecs/systems/orbit');
const createPatrolSystem = require('../../ecs/systems/patrol');
const createTransformSystem = require('../../ecs/systems/transform');

const createPlayer = require('../../ecs/entities/player');

module.exports = class WebTest {
    constructor(app, manager, globalState) {
        this.app = app;
        this.manager = manager;
        this.world = createWorld();
        this.state = globalState || { debug: true };
    }

    async init() {
        this.keyboardSystem = createKeyboardSystem();
        this.debugSystem = createDebugSystem(this.state);
        this.inputSystem = createInputSystem();
        this.movementSystem = createMovementSystem();
        this.orbitSystem = createOrbitSystem();
        this.patrolSystem = createPatrolSystem();
        this.transformSystem = createTransformSystem();
        this.platformSystem = createPlatformSystem();
        this.cameraSystem = createCameraSystem(this.app);
        this.renderSystem = createRenderSystem(this.app, this.state);

        // 1. SUN (World Origin)
        const sun = this.createEntity(0, 0, 60, 60, 0xFFCC00);

        // CAMERA TARGET 1: The Sun (The Anchor)
        addComponent(this.world, CameraTarget, sun);

        // 2. PLANET (Orbiting)
        const planet = this.createEntity(250, 0, 40, 40, 0x00FFCC);

        // Parent Planet to Sun
        addComponent(this.world, Parent, planet);
        Parent.eid[planet] = sun;

        // Orbit Settings
        addComponent(this.world, Orbit, planet);
        Orbit.radius[planet] = 250;
        Orbit.speed[planet] = 1.0;
        Orbit.angle[planet] = 0;

        // 3. PLAYER (Spawned INSIDE the Planet)
        // Local Position: (0, 0) - Dead Center
        const player = createPlayer(this.world, 0, 0);

        // Hard-link Parent
        addComponent(this.world, Parent, player);
        Parent.eid[player] = planet;

        // Sync WorldSpace to exactly match Planet's start
        addComponent(this.world, WorldSpace, player);
        WorldSpace.x[player] = 250;
        WorldSpace.y[player] = 0;

        // CAMERA TARGET 2: The Player
        addComponent(this.world, CameraTarget, player);

        // 4. WEBS
        this.createWeb(sun, planet);

        const kbEntity = addEntity(this.world);
        addComponent(this.world, Keyboard, kbEntity);

        this._onExit = (e) => {
            if (e.code === 'Backspace') this.manager.loadScene(require('../MenuScene'));
        };
        window.addEventListener('keydown', this._onExit);
    }

    createEntity(x, y, w, h, color) {
        const eid = addEntity(this.world);
        addComponent(this.world, Position, eid);
        addComponent(this.world, Velocity, eid);
        addComponent(this.world, Platform, eid);
        addComponent(this.world, Graphic, eid);
        addComponent(this.world, WorldSpace, eid);

        // Initial State
        Position.x[eid] = x; Position.y[eid] = y;
        WorldSpace.x[eid] = x; WorldSpace.y[eid] = y;

        Platform.width[eid] = w; Platform.height[eid] = h;
        Graphic.controllerId[eid] = 2;
        Graphic.color[eid] = color;
        return eid;
    }

    createWeb(a, b) {
        const web = addEntity(this.world);
        addComponent(this.world, Position, web);
        addComponent(this.world, WorldSpace, web);
        addComponent(this.world, Graphic, web);
        addComponent(this.world, Web, web);
        Web.entityA[web] = a;
        Web.entityB[web] = b;
        Graphic.controllerId[web] = 3;
        return web;
    }

    update() {
        const dt = this.app.ticker.deltaMS / 1000;

        this.keyboardSystem(this.world);
        this.debugSystem(this.world);

        // 1. Move Environment
        this.orbitSystem(this.world, dt);
        this.patrolSystem(this.world, dt);

        // 2. Move Player
        this.inputSystem(this.world);
        this.movementSystem(this.world, this.app.ticker.elapsedMS);

        // 3. Resolve Hierarchy
        this.transformSystem(this.world);

        // 4. Check Attachments
        this.platformSystem(this.world);

        // 5. Render & Camera
        this.cameraSystem(this.world);
        this.renderSystem(this.world);
    }

    destroy() {
        window.removeEventListener('keydown', this._onExit);
        this.app.stage.removeChildren();
    }
};