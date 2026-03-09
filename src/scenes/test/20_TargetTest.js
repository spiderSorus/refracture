// src/scenes/test/20_TargetTest.js
import { createPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform, createPlatform } from '../../ecs/entities/platforms';
import { createTarget } from '../../ecs/entities/target';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    Mass, Velocity, ZLayer
} from '../../ecs/components/index';
import Phaser from 'phaser';

export class TargetTest extends BaseTestScene {
    constructor() {
        super('TargetTest', 'Target Test', 'Climb the target trail!');
        this.meditationEnabled = false;
    }

    create() {
        super.create();

        const WORLD_WIDTH = 2000;
        const WORLD_HEIGHT = 6000;
        // Bounds from -1000 to 1000 width, -5500 to 500 height
        this.cameras.main.setBounds(-WORLD_WIDTH / 2, -WORLD_HEIGHT + 500, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(1);

        if (!this.textures.exists('bg_grid')) {
            const gfx = this.make.graphics({ x: 0, y: 0, add: false });
            gfx.lineStyle(2, 0x1a1a1a, 1);
            gfx.strokeRect(0, 0, 100, 100);
            gfx.generateTexture('bg_grid', 100, 100);
        }
        const grid = this.add.tileSprite(0, -WORLD_HEIGHT/2 + 250, WORLD_WIDTH, WORLD_HEIGHT, 'bg_grid').setDepth(0);
        if (this.backgroundLayer) this.backgroundLayer.add(grid);

        const borderGfx = this.add.graphics();
        if (this.backgroundLayer) this.backgroundLayer.add(borderGfx);
        borderGfx.lineStyle(4, 0xffffff, 1);
        borderGfx.strokeRect(-WORLD_WIDTH / 2, -WORLD_HEIGHT + 500, WORLD_WIDTH, WORLD_HEIGHT);

        const spawnX = 0;
        const spawnY = 0;

        // 0. SPAWN PLATFORM
        this.addEntity(createSpawnPlatform(spawnX, spawnY, { width: 400, height: 100 }));

        this.addEntity([
            ...createPlayer(spawnX, spawnY - 50),
            SlingshotJump(3500)
        ]);

        // 1. GENERATE TRAIL
        const numSteps = 15;
        const stepHeight = 350;
        const spreadX = 400;

        for (let i = 1; i <= numSteps; i++) {
            const py = spawnY - (i * stepHeight);
            const px = (i % 2 === 0 ? 1 : -1) * (spreadX / 2 + Math.random() * 200);
            
            // Add Platform
            this.addEntity([
                ...createPlatform(px, py, { width: 150, height: 40, isStatic: true, color: 0x444444 }),
                ZLayer('PLAY', 10)
            ]);

            // Add Target between platforms or above
            const tx = px + (i % 2 === 0 ? -200 : 200);
            const ty = py - stepHeight / 2;
            this.addEntity(createTarget(tx, ty, 50, 50));
            
            // Add a target directly above some platforms
            if (i % 3 === 0) {
                this.addEntity(createTarget(px, py - 150, 40, 40));
            }
        }

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
