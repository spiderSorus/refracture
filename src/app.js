import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { TestMenuScene } from './scenes/TestMenuScene';
import { TestScenes } from './scenes/test/index'; // Import the array
import { AquarellePipeline } from './graphics/AquarellePipeline';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#050505',
    transparent: true,
    parent: 'game-container',
    input: { gamepad: true },
    pipeline: { AquarellePipeline },
    scene: [
        MenuScene,
        TestMenuScene,
        ...TestScenes
    ]
};

new Phaser.Game(config);