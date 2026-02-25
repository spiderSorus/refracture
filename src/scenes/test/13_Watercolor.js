import { createPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform } from '../../ecs/entities/platforms';
import { loadBackground } from '../../backgrounds/index';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    Mass, Velocity, ViewLayers, ZLayer
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
        this.cameras.main.setPostPipeline('AquarellePipeline');
        
        // --- LOAD BACKGROUND ---
        loadBackground('cathedral_pink_blue', this, { worldSize: WORLD_SIZE });

        const spawnX = 0;
        const spawnY = 0;

        // 0. SPAWN PLATFORM (Play Layer 5)
        const spawnPlat = this.addEntity(createSpawnPlatform(spawnX, spawnY, { width: 400, height: 100, color: 0x444444 }));
        spawnPlat.components.ZLayer = ZLayer('PLAY', 5);

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            SlingshotJump(3500),
            ViewLayers(['BASE', 'FAIRY']),
            ZLayer('PLAY', 0)
        ]);
        
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
