// src/entries/lab.js
// Lab / Sandbox Suite Entry — strictly for isolated mechanic sandboxes (excludes the shipped Game scenes).
import { LabMenuScene } from '../scenes/lab/LabMenuScene';
import { LabScenes } from '../scenes/lab/LabRegistry';
import { AquarellePipeline } from '../graphics/AquarellePipeline';
import { GrayscalePipeline } from '../graphics/GrayscalePipeline';
import { OldGlassPipeline } from '../graphics/OldGlassPipeline';
import { RainbowPipeline } from '../graphics/RainbowPipeline';

export const runtimeScenes = [
    LabMenuScene,
    ...LabScenes
];

export const runtimePipelines = {
    AquarellePipeline,
    GrayscalePipeline,
    OldGlassPipeline,
    RainbowPipeline
};
