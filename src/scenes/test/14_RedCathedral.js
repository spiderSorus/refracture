import { createPlayer, spawnPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform } from '../../ecs/entities/platforms';
import { loadBackground } from '../../backgrounds/index';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    Mass, Velocity, ZLayer, Rotation
} from '../../ecs/components/index';
import Phaser from 'phaser';

export class RedCathedralScene extends BaseTestScene {
    constructor() {
        super('RedCathedralScene', 'Red Cathedral', 'The endless climb.');
    }

    create() {
        super.create();

        const WORLD_WIDTH = 4000;
        const WORLD_HEIGHT = 100000;
        const spawnX = 0;
        const spawnY = WORLD_HEIGHT / 2 - 500; // Bottom of the coordinate system

        this.cameras.main.setBounds(-WORLD_WIDTH / 2, -WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(0.8);
        this.cameras.main.setBackgroundColor(0x080000); // Very dark red/black
        
        // Apply effect to the background layer specifically
        if (this.bgLayer) {
            this.bgLayer.setPostPipeline('AquarellePipeline');
        }
        
        // --- LOAD BACKGROUND ---
        loadBackground('cathedral', this, { worldWidth: WORLD_WIDTH, worldHeight: WORLD_HEIGHT });

        // 0. SPAWN PLATFORM
        const spawnPlat = this.addEntity(createSpawnPlatform(spawnX, spawnY, { width: 600, height: 100, color: 0x444444 }));
        spawnPlat.components.ZLayer = ZLayer('PLAY', 5);

        // 1. GENERATE CLIMBING PLATFORMS
        let currentY = spawnY - 600;
        while (currentY > -WORLD_HEIGHT / 2 + 1000) {
            const x = Phaser.Math.Between(-WORLD_WIDTH / 2 + 500, WORLD_WIDTH / 2 - 500);
            const radius = Phaser.Math.Between(80, 200);
            
            this.addEntity([
                Position(x, currentY),
                Velocity(0, 0),
                Rotation(0),
                PlatformTag(),
                EntityType('PLATFORM'),
                Mass(10),
                Renderable({
                    'BASE': {
                        type: 'circle',
                        radius: radius,
                        color: 0x333333,
                        alpha: 1.0
                    }
                }),
                Collider('circle', radius),
                ZLayer('PLAY', 10)
            ]);

            currentY -= Phaser.Math.Between(400, 800); // Gap between platforms
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
