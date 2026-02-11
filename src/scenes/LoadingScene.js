const PIXI = require('pixi.js');
const MenuScene = require('./MenuScene');

module.exports = class LoadingScene {
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;
        this.box = new PIXI.Graphics();
        this.currentSize = 0;
        this.targetSize = 200;
        this.growthSpeed = 300; // pixels per second
    }

    async init() {
        console.log("LoadingScene: Initializing Centered Growth...");

        // Draw a 1x1 rect so we can scale it effectively, 
        // or just redraw the rect in the update loop.
        // We will position it in the center of the screen.
        this.box.x = this.app.screen.width / 2;
        this.box.y = this.app.screen.height / 2;

        this.app.stage.addChild(this.box);
    }

    update() {
        const dt = this.app.ticker.deltaMS / 1000;

        if (this.currentSize < this.targetSize) {
            this.currentSize += this.growthSpeed * dt;

            // Re-draw the box centered on its own coordinates
            this.box.clear();
            this.box.rect(
                -this.currentSize / 2,
                -this.currentSize / 2,
                this.currentSize,
                this.currentSize
            ).fill(0x0000FF);
        } else {
            // Once we hit 200px, transition
            this.manager.loadScene(MenuScene);
        }
    }

    destroy() {
        console.log("LoadingScene: Transitioning to Menu...");
        this.app.stage.removeChild(this.box);
        this.box.destroy();
    }
};