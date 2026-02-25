import { createPlayer, spawnPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform, createPlatform } from '../../ecs/entities/platforms';
import { loadBackground } from '../../backgrounds/index';
import { BaseTestScene } from './BaseTestScene';
import { PHYSICS } from '../../core/Constants';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    Mass, Velocity, ZLayer
} from '../../ecs/components/index';
import Phaser from 'phaser';

export class WatercolorScene extends BaseTestScene {
    constructor() {
        super('WatercolorScene', 'Cathedral of Red', 'Pink & Blue Glass.');
    }

    create() {
        super.create();

        const WORLD_SIZE = 8000;
        this.cameras.main.setBounds(-WORLD_SIZE / 2, -WORLD_SIZE / 2, WORLD_SIZE, WORLD_SIZE);
        this.cameras.main.setZoom(0.8);
        this.cameras.main.setBackgroundColor(0xffffff); // White background
        
        // Apply effect to the background layer specifically
        if (this.bgLayer) {
            this.bgLayer.setPostPipeline('AquarellePipeline');
        }
        
        // --- LOAD BACKGROUND ---
        loadBackground('cathedral_pink_blue', this, { worldSize: WORLD_SIZE });

        const spawnX = 0;
        const spawnY = 0;

        // 0. SPAWN PLATFORM (Play Layer 5)
        const spawnPlat = this.addEntity(createSpawnPlatform(spawnX, spawnY, { width: 400, height: 100, color: 0x444444 }));
        spawnPlat.components.ZLayer = ZLayer('PLAY', 5);

        // --- RANDOM STATIC PLATFORMS ---
        const PLATFORM_COUNT = 50;
        const halfSize = WORLD_SIZE / 2 - 500;
        const colors = [0x880000, 0x008800, 0x000088, 0x888800, 0x880088, 0x008888, 0x444444];

        for (let i = 0; i < PLATFORM_COUNT; i++) {
            let rx = Phaser.Math.Between(-halfSize, halfSize);
            let ry = Phaser.Math.Between(-halfSize, halfSize);

            // Avoid spawn area (approx 600px radius)
            while (Math.abs(rx - spawnX) < 600 && Math.abs(ry - spawnY) < 600) {
                rx = Phaser.Math.Between(-halfSize, halfSize);
                ry = Phaser.Math.Between(-halfSize, halfSize);
            }

            const rw = Phaser.Math.Between(100, 400);
            const rh = Phaser.Math.Between(40, 150);
            const color = colors[Phaser.Math.Between(0, colors.length - 1)];

            this.addEntity(createPlatform(rx, ry, {
                width: rw,
                height: rh,
                color: color,
                isStatic: true
            }));
        }

        // 2. PLAYER
        spawnPlayer(this, spawnPlat);
        
        this.cameras.main.centerOn(spawnX, spawnY);
    }

    fixedUpdate(time, dt) {
        // Force player ZLayer every frame to handle respawns
        const player = this.entities.find(e => e.components.PlayerTag && !e.toDestroy);
        if (player) {
            player.components.ZLayer = ZLayer('PLAY', 0);
        }
    }
}
