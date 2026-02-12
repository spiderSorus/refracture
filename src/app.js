import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { TestMenuScene } from './scenes/TestMenuScene';
import { TestScenes } from './scenes/test/index';

// Combine all scenes into one list
const allScenes = [MenuScene, TestMenuScene, ...TestScenes];

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#080808',
    input: { gamepad: true }, // Enable controller!
    scene: allScenes
};

new Phaser.Game(config);