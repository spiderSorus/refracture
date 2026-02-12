import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { TestMenuScene } from './scenes/TestMenuScene';
import { TestScenes } from './scenes/test/index'; // Import the array

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#050505',
    parent: 'game-container',
    input: { gamepad: true },
    scene: [
        MenuScene,
        TestMenuScene,
        ...TestScenes
    ]
};

new Phaser.Game(config);