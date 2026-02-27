// src/scenes/test/02_ForestSlice.js
import { createPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform } from '../../ecs/entities/platforms';
import { BaseTestScene } from './BaseTestScene';
import { PHYSICS } from '../../core/Constants';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    Velocity, BugTag, BugAI, GravityExempt, ZLayer
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
        const WORLD_HEIGHT = 10000;
        // Adjust bounds so 0,0 is near the bottom
        this.cameras.main.setBounds(-WORLD_WIDTH / 2, -WORLD_HEIGHT + 1000, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(0.5);

        if (!this.textures.exists('bg_grid')) {
            const gfx = this.make.graphics({ x: 0, y: 0, add: false });
            gfx.lineStyle(2, 0x1a1a1a, 1);
            gfx.strokeRect(0, 0, 100, 100);
            gfx.generateTexture('bg_grid', 100, 100);
        }
        const grid = this.add.tileSprite(0, -WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 'bg_grid').setDepth(0);
        if (this.backgroundLayer) this.backgroundLayer.add(grid);

        const spawnX = 0;
        const spawnY = 100;

        // 0. SPAWN PLATFORM
        this.addEntity(createSpawnPlatform(spawnX, spawnY, { color: 0x228b22, width: 600 }));

        // Forest-like procedural generation - PATH TO THE TOP
        let currentY = spawnY - 500;
        let lastX = spawnX;

        for (let i = 0; i < 60; i++) {
            const nextX = lastX + Phaser.Math.Between(-600, 600);
            const clampedX = Phaser.Math.Clamp(nextX, -WORLD_WIDTH / 2 + 500, WORLD_WIDTH / 2 - 500);
            
            const size = Phaser.Math.Between(80, 150);
            const color = 0x556b2f; 
            
            this.addEntity([
                Position(clampedX, currentY),
                PlatformTag(),
                EntityType('PLATFORM'),
                Renderable({ 'BASE': { type: 'circle', radius: size, color: color } }),
                Collider('circle', size),
                ZLayer('PLAY', 0)
            ]);

            lastX = clampedX;
            currentY -= Phaser.Math.Between(400, 700); // Consistent vertical gap
        }

        // Spawn Bugs
        for (let i = 0; i < 100; i++) {
            const bx = Phaser.Math.Between(-WORLD_WIDTH / 2, WORLD_WIDTH / 2);
            const by = Phaser.Math.Between(-WORLD_HEIGHT, 1000);
            this.addEntity([
                Position(bx, by),
                Velocity(0, 0),
                BugTag(),
                GravityExempt(),
                BugAI(),
                Renderable({ 'BASE': { type: 'circle', radius: 6, color: 0xffff00 } })
            ]);
        }

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            SlingshotJump(PHYSICS.SLINGSHOT_FORCE)
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
