import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { TestMenuScene } from './scenes/TestMenuScene';
import { TestScenes } from './scenes/test/index'; // Import the array
import { AquarellePipeline } from './graphics/AquarellePipeline';
import { GrayscalePipeline } from './graphics/GrayscalePipeline';
import { OldGlassPipeline } from './graphics/OldGlassPipeline';
import { RainbowPipeline } from './graphics/RainbowPipeline';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#050505',
    transparent: true,
    parent: 'game-container',
    input: { gamepad: true },
    pipeline: { AquarellePipeline, GrayscalePipeline, OldGlassPipeline, RainbowPipeline },
    scene: [
        MenuScene,
        TestMenuScene,
        ...TestScenes
    ]
};

new Phaser.Game(config);