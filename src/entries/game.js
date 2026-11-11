// src/entries/game.js
// Shipped Game Runtime Entry — strictly excludes all Lab / Sandbox code.
import Phaser from 'phaser';
import { GameMenuScene } from '../scenes/game/GameMenuScene';
import { RefractureGameScene } from '../scenes/game/RefractureGameScene';
import { AquarellePipeline } from '../graphics/AquarellePipeline';
import { GrayscalePipeline } from '../graphics/GrayscalePipeline';
import { OldGlassPipeline } from '../graphics/OldGlassPipeline';
import { RainbowPipeline } from '../graphics/RainbowPipeline';

export const runtimeScenes = [
    GameMenuScene,
    RefractureGameScene
];

export const runtimePipelines = {
    AquarellePipeline,
    GrayscalePipeline,
    OldGlassPipeline,
    RainbowPipeline
};
