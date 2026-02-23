// src/scenes/test/02_ForestSlice.js
import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, AbilityState, EntityType, SlingshotJump,
    Velocity, BugTag, BugAI, GravityExempt, SpawnTag, RealityLevel
} from '../../ecs/components/index';
import Phaser from 'phaser';

export class ForestSlice extends BaseTestScene {
    constructor() {
        super('ForestSlice', 'Forest Slice', 'The dense canopy.');
        this.meditationEnabled = false;
    }

    create() {
        super.create();

        const WORLD_WIDTH = 4000;
        const WORLD_HEIGHT = 8000;

        this.cameras.main.setBounds(0, -WORLD_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(0.5);

        if (!this.textures.exists('bg_grid')) {
            const gfx = this.make.graphics({ x: 0, y: 0, add: false });
            gfx.lineStyle(2, 0x1a1a1a, 1);
            gfx.strokeRect(0, 0, 100, 100);
            gfx.generateTexture('bg_grid', 100, 100);
        }

        const bg = this.add.tileSprite(WORLD_WIDTH / 2, -WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 'bg_grid');
        bg.setDepth(0);

        const floorGfx = this.add.graphics();
        floorGfx.lineStyle(10, 0x228b22, 1);
        floorGfx.lineBetween(0, 5, WORLD_WIDTH, 5);

        // --- 0. SPAWN PLATFORM ---
        const spawnX = WORLD_WIDTH / 2;
        const spawnY = -150;
        this.addEntity([
            Position(spawnX, spawnY),
            PlatformTag(),
            SpawnTag(),
            RealityLevel([0], [0]),
            EntityType('PLATFORM'),
            Renderable({ 'BASE': { type: 'circle', radius: 50, color: 0x228b22 } }),
            Collider('circle', 50)
        ]);

        // --- 1. CENTER FLOATER ---
        this.addEntity([
            Position(WORLD_WIDTH / 2, -WORLD_HEIGHT / 2),
            PlatformTag(),
            RealityLevel([0], [0]),
            EntityType('PLATFORM'),
            Renderable({ 'BASE': { type: 'circle', radius: 120, color: 0xff00ff } }),
            Collider('circle', 120)
        ]);

        // Forest-like procedural generation
        let lastPos = { x: spawnX, y: spawnY };
        const platformCount = 60;

        for (let i = 0; i < platformCount; i++) {
            const angle = Phaser.Math.FloatBetween(Math.PI * 1.1, Math.PI * 1.9);
            const dist = Phaser.Math.Between(300, 700);

            let nextX = lastPos.x + Math.cos(angle) * dist;
            let nextY = lastPos.y + Math.sin(angle) * dist;

            nextX = Phaser.Math.Clamp(nextX, 400, WORLD_WIDTH - 400);

            const size = Phaser.Math.Between(60, 120);
            const color = 0x556b2f; 

            this.addEntity([
                Position(nextX, nextY),
                PlatformTag(),
                RealityLevel([0], [0]),
                EntityType('PLATFORM'),
                Renderable({ 'BASE': { type: 'circle', radius: size, color: color } }),
                Collider('circle', size)
            ]);
            lastPos = { x: nextX, y: nextY };
        }

        // Spawn Bugs
        for (let i = 0; i < 100; i++) {
            const bx = Math.random() * WORLD_WIDTH;
            const by = -(Math.random() * WORLD_HEIGHT);
            this.addEntity([
                Position(bx, by),
                Velocity(0, 0),
                BugTag(),
                RealityLevel([0], [0]),
                GravityExempt(),
                BugAI(),
                Renderable({
                    'BASE': { type: 'circle', radius: 6, color: 0xffff00 }
                })
            ]);
        }

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            AbilityState(),
            SlingshotJump(3000),
            RealityLevel([0], [0])
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
