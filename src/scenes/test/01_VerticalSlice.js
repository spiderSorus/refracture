// src/scenes/test/01_VerticalSlice.js
import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    SpawnTag, RealityLevel
} from '../../ecs/components/index';
import Phaser from 'phaser';

export class VerticalSlice extends BaseTestScene {
    constructor() {
        super('VerticalSlice', 'Vertical Slice 01', 'Climb to the summit.');
        this.meditationEnabled = false;
    }

    create() {
        super.create();

        const WORLD_WIDTH = 3000;
        const WORLD_HEIGHT = 10000;

        this.cameras.main.setBounds(0, -WORLD_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(0.6);

        if (!this.textures.exists('bg_grid')) {
            const gfx = this.make.graphics({ x: 0, y: 0, add: false });
            gfx.lineStyle(2, 0x1a1a1a, 1);
            gfx.strokeRect(0, 0, 100, 100);
            gfx.generateTexture('bg_grid', 100, 100);
        }

        const bg = this.add.tileSprite(WORLD_WIDTH / 2, -WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 'bg_grid');
        bg.setDepth(0);

        const floorGfx = this.add.graphics();
        floorGfx.lineStyle(10, 0x00ff00, 1);
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
            Renderable({ 'BASE': { type: 'rect', width: 100, height: 20, color: 0x00ff00 } }),
            Collider('rect', 0, 100, 20)
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

        // Procedural Platforms
        let lastPos = { x: spawnX, y: spawnY };
        const platformCount = 75;
        const jumpDistance = 850;

        for (let i = 0; i < platformCount; i++) {
            const angle = Phaser.Math.FloatBetween(Math.PI, Math.PI * 2);
            const dist = Phaser.Math.Between(450, jumpDistance);

            let nextX = lastPos.x + Math.cos(angle) * dist;
            let nextY = lastPos.y + Math.sin(angle) * dist;

            nextX = Phaser.Math.Clamp(nextX, 500, WORLD_WIDTH - 500);

            const isCircle = Math.random() > 0.4;
            const size = Phaser.Math.Between(80, 180);
            const color = Phaser.Display.Color.RandomRGB(40).color;

            const components = [
                Position(nextX, nextY),
                PlatformTag(),
                RealityLevel([0], [0]),
                EntityType('PLATFORM')
            ];

            if (isCircle) {
                components.push(Renderable({ 'BASE': { type: 'circle', radius: size, color: color } }));
                components.push(Collider('circle', size));
            } else {
                const w = size * 2.5;
                const h = Phaser.Math.Between(60, 130);
                components.push(Renderable({ 'BASE': { type: 'rect', width: w, height: h, color: color } }));
                components.push(Collider('rect', 0, w, h));
            }

            this.addEntity(components);
            lastPos = { x: nextX, y: nextY };
        }

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            SlingshotJump(3000),
            RealityLevel([0], [0])
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
