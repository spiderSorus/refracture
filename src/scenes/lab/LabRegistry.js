// src/scenes/lab/LabRegistry.js
import { WorldGraphLabScene } from './01_WorldGraphLab';
import { TestScenes as LegacyTestScenes } from '../test/index';

export const LAB_SPACES = [
    {
        id: 'world-graph',
        label: '1. World Graph & Fractures',
        subtitle: 'Corners -> Edges -> Cells Graph & Decoupled Styles',
        scenes: [
            { label: '01_WorldGraphLab (Fracture Graph & Styles)', scene: 'WorldGraphLabScene' }
        ]
    },
    {
        id: 'cell-physics',
        label: '2. Cell Physics & Gravity',
        subtitle: 'Mutual Mass/Density Gravity, Push/Pull & Equilibrium',
        scenes: [
            { label: 'Legacy: PullTest', scene: 'PullTest' },
            { label: 'Legacy: WallsTest', scene: 'WallsTest' }
        ]
    },
    {
        id: 'yijing-energy',
        label: '3. Yijing Energy (64 States)',
        subtitle: '64 Energy Types, Cell Stored & Background Energy',
        scenes: [
            { label: 'Legacy: EnergySystems3', scene: 'EnergySystems3' },
            { label: 'Legacy: EnergySystems2', scene: 'EnergySystems2' },
            { label: 'Legacy: EnergySystems1', scene: 'EnergySystems1' },
            { label: 'Legacy: EnergySystems0', scene: 'EnergySystems0' }
        ]
    },
    {
        id: 'player-spider',
        label: '4. Player (Spider & Zoom)',
        subtitle: 'Dot-to-Spider Zoom, Vector Scale & State Visuals',
        scenes: [
            { label: 'Legacy: PlayerTest', scene: 'PlayerTest' },
            { label: 'Legacy: TargetTest', scene: 'TargetTest' }
        ]
    },
    {
        id: 'items-ecology',
        label: '5. Ecological Items & Abilities',
        subtitle: 'Passive/Active Abilities, 64-Type Targets, Creatures/Plants',
        scenes: [
            { label: 'Legacy: PlantsScene', scene: 'PlantsScene' },
            { label: 'Legacy: ChaosLab', scene: 'ChaosLab' }
        ]
    },
    {
        id: 'visuals-maia-ziran',
        label: '6. Visuals (Maia & Ziran)',
        subtitle: '64 I Ching Themes, Background & Entity Procedural Art',
        scenes: [
            { label: 'Legacy: RainbowArtistLab', scene: 'RainbowArtistLab' },
            { label: 'Legacy: ArtistLab', scene: 'ArtistLab' },
            { label: 'Legacy: Renderama', scene: 'Renderama' },
            { label: 'Legacy: RainbowCathedralScene', scene: 'RainbowCathedralScene' },
            { label: 'Legacy: RedCathedralScene', scene: 'RedCathedralScene' },
            { label: 'Legacy: WatercolorScene', scene: 'WatercolorScene' }
        ]
    },
    {
        id: 'legacy-archive',
        label: 'Archive: All Legacy Scenes',
        subtitle: 'Original 23 Experimental Gallery Scenes',
        scenes: [...LegacyTestScenes].reverse().map(sceneClass => ({
            label: sceneClass.name,
            scene: sceneClass.name
        }))
    }
];

export const LabScenes = [
    WorldGraphLabScene,
    ...LegacyTestScenes
];
