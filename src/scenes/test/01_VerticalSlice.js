// src/scenes/test/01_VerticalSlice.js
import { createPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform } from '../../ecs/entities/platforms';
import { BaseTestScene } from './BaseTestScene';
import { PHYSICS } from '../../core/Constants';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump, ZLayer
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
        const grid = this.add.tileSprite(WORLD_WIDTH / 2, -WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 'bg_grid').setDepth(0);
        if (this.bgLayer) this.bgLayer.add(grid);

        const spawnX = WORLD_WIDTH / 2;
        const spawnY = -WORLD_HEIGHT / 2;

        // 0. SPAWN PLATFORM
        this.addEntity(createSpawnPlatform(spawnX, spawnY));

        // 1. CENTER FLOATER
        this.addEntity([
            Position(WORLD_WIDTH / 2, spawnY - 500),
            PlatformTag(),
            EntityType('PLATFORM'),
            Renderable({ 'BASE': { type: 'circle', radius: 120, color: 0xff00ff } }),
            Collider('circle', 120)
        ]);

        // Procedural Platforms
        let lastPos = { x: spawnX, y: spawnY };
        for (let i = 0; i < 75; i++) {
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const dist = Phaser.Math.Between(450, 850);
            let nextX = lastPos.x + Math.cos(angle) * dist;
            let nextY = lastPos.y + Math.sin(angle) * dist;
            nextX = Phaser.Math.Clamp(nextX, 500, WORLD_WIDTH - 500);
            nextY = Phaser.Math.Clamp(nextY, -WORLD_HEIGHT + 500, -500);

            const isCircle = Math.random() > 0.4;
            const size = Phaser.Math.Between(80, 180);
            const color = Phaser.Display.Color.RandomRGB(40).color;
            const components = [
                Position(nextX, nextY), 
                PlatformTag(), 
                EntityType('PLATFORM'),
                ZLayer('PLAY', 0)
            ];
            if (isCircle) {
                components.push(Renderable({ 'BASE': { type: 'circle', radius: size, color: color } }));
                components.push(Collider('circle', size));
            } else {
                const w = size * 2.5; const h = Phaser.Math.Between(60, 130);
                components.push(Renderable({ 'BASE': { type: 'rect', width: w, height: h, color: color } }));
                components.push(Collider('rect', 0, w, h));
            }
            this.addEntity(components);
            lastPos = { x: nextX, y: nextY };
        }

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            SlingshotJump(PHYSICS.SLINGSHOT_FORCE)
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
