import { createPlayer, spawnPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform, createPlatform } from '../../ecs/entities/platforms';
import { loadBackground } from '../../backgrounds/index';
import { BaseTestScene } from './BaseTestScene';
import { PHYSICS } from '../../core/Constants';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    Mass, Velocity, ZLayer, Rotation
} from '../../ecs/components/index';
import Phaser from 'phaser';

export class Renderama extends BaseTestScene {
    constructor() {
        super('Renderama', 'Renderama', 'Complex camera experiments.');
    }

    create() {
        super.create();

        const WORLD_WIDTH = 4000;
        const WORLD_HEIGHT = 100000;
        const spawnX = 0;
        const spawnY = WORLD_HEIGHT / 2 - 500; // Bottom of the coordinate system

        this.cameras.main.setBounds(-WORLD_WIDTH / 2, -WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(0.8);
        this.cameras.main.setBackgroundColor(0x000000); // Black background for rainbow contrast
        
        // Define dynamic camera configuration
        this.cameraConfigs = [
            { name: 'BackgroundWC', layer: 'bg_watercolor', effect: 'watercolor', type: 'BACK' },
            { name: 'BackgroundOldGlass', layer: 'bg_glass', effect: 'old_glass', type: 'BACK' },
            { name: 'ForegroundBW', layer: 'fg_grayscale', effect: 'grayscale', type: 'FORE' }
        ];
        
        // --- LOAD BACKGROUND ---
        loadBackground('complexity2', this, { 
            worldWidth: WORLD_WIDTH, 
            worldHeight: WORLD_HEIGHT
        });

        // 0. SPAWN PLATFORM
        const spawnPlat = this.addEntity(createSpawnPlatform(spawnX, spawnY, { 
            width: 600, 
            height: 100, 
            color: 0x444444 
        }));
        spawnPlat.components.ZLayer = ZLayer('FORE', 5, 'fg_grayscale');

        // 1. GENERATE CLIMBING PLATFORMS
        let currentY = spawnY - 600;
        const colors = [0x440000, 0x660000, 0x333333, 0x222222, 0x550000];

        while (currentY > -WORLD_HEIGHT / 2 + 1000) {
            const x = Phaser.Math.Between(-WORLD_WIDTH / 2 + 500, WORLD_WIDTH / 2 - 500);
            const w = Phaser.Math.Between(150, 400);
            const h = Phaser.Math.Between(40, 100);
            const color = colors[Phaser.Math.Between(0, colors.length - 1)];
            const shape = Phaser.Math.Between(0, 10) > 7 ? 'circle' : 'rect';

            this.addEntity(createPlatform(x, currentY, {
                width: w,
                height: h,
                color: color,
                shape: shape,
                isStatic: true,
                depth: 10
            }));

            // Sync ZLayer for these platforms
            const lastEnt = this.entities[this.entities.length - 1];
            lastEnt.components.ZLayer = ZLayer('FORE', 10, 'fg_grayscale');

            currentY -= Phaser.Math.Between(350, 600); // Tighter gaps for easier climbing
        }

        // 2. PLAYER
        spawnPlayer(this, spawnPlat);
        
        this.cameras.main.centerOn(spawnX, spawnY);
    }

    fixedUpdate(time, dt) {
        const player = this.entities.find(e => e.components.PlayerTag && !e.toDestroy);
        if (player) {
            player.components.ZLayer = ZLayer('PLAY', 0);
        }
    }
}
