module.exports = class SceneManager {
    constructor(app) {
        this.app = app;
        this.currentScene = null;
        this.isLoading = false; // LOCK
        this.globalState = {
            debug: true,
            ppu: 8
        };
    }

    async loadScene(SceneClass) {
        if (this.isLoading) return; // Prevent double load
        this.isLoading = true;

        console.log(`SceneManager: Loading ${SceneClass.name}...`);

        // 1. Cleanup Old Scene
        if (this.currentScene) {
            this.app.ticker.remove(this.currentScene.update, this.currentScene);
            if (this.currentScene.destroy) {
                this.currentScene.destroy();
            }
        }

        // 2. Initialize New Scene
        try {
            this.currentScene = new SceneClass(this.app, this, this.globalState);
            await this.currentScene.init();

            // 3. Start New Loop
            this.app.ticker.add(this.currentScene.update, this.currentScene);
        } catch (e) {
            console.error("Scene Init Failed:", e);
        }

        this.isLoading = false;
    }
};