// src/scenes/test/10_VerticalSlice.js
import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, AbilityState, EntityType, SlingshotJump
} from '../../ecs/components/index';
import Phaser from 'phaser';

export class VerticalSlice extends BaseTestScene {
    constructor() {
        super('VerticalSlice', 'Vertical Slice', 'Hard Floor at 0. Climb to -10,000.');
    }

    create() {
        super.create();

        const WORLD_WIDTH = 3000;
        const WORLD_HEIGHT = 10000;

        // Set bounds so 0 is the floor and height is negative
        this.cameras.main.setBounds(0, -WORLD_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(0.6);

        if (!this.textures.exists('bg_grid')) {
            const gfx = this.make.graphics({ x: 0, y: 0, add: false });
            gfx.lineStyle(2, 0x1a1a1a, 1);
            gfx.strokeRect(0, 0, 100, 100);
            gfx.generateTexture('bg_grid', 100, 100);
        }

        // Tile background covers the negative space
        const bg = this.add.tileSprite(WORLD_WIDTH / 2, -WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 'bg_grid');
        bg.setDepth(0);

        // Visual Floor (Just for the player's eyes)
        const floorGfx = this.add.graphics();
        floorGfx.lineStyle(10, 0x00ff00, 1);
        floorGfx.lineBetween(0, 5, WORLD_WIDTH, 5);

        // Procedural Platforms
        let lastPos = { x: WORLD_WIDTH / 2, y: -200 };
        const platformCount = 75;
        const jumpDistance = 850;

        for (let i = 0; i < platformCount; i++) {
            // Random upward angle (Phaser negative Y is UP)
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

        // Spawn Player directly on the hard floor
        const spawnX = WORLD_WIDTH / 2;
        const spawnY = 0;

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            AbilityState(),
            SlingshotJump(3000)
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}