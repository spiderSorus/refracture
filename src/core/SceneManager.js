module.exports = class SceneManager {
    constructor(app) {
        this.app = app;
        this.currentScene = null;
    }

    async loadScene(SceneClass) {
        console.log(`SceneManager: Loading ${SceneClass.name}...`);

        // 1. Cleanup old scene
        if (this.currentScene) {
            this.app.ticker.remove(this.currentScene.update, this.currentScene);
            this.currentScene.destroy();
        }

        // 2. Initialize new scene
        this.currentScene = new SceneClass(this.app, this);
        await this.currentScene.init();

        // 3. Re-attach ticker
        // We bind 'this' so the scene update has access to its own properties
        this.app.ticker.add(this.currentScene.update, this.currentScene);
    }
};