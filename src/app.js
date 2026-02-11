const SceneManager = require('./core/SceneManager');
const LoadingScene = require('./scenes/LoadingScene');

async function initGame(app) {
    const director = new SceneManager(app);
    // Load the animation scene first
    await director.loadScene(LoadingScene);
}

module.exports = { initGame };