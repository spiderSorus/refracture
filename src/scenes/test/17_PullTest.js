import { createPlayer, spawnPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform } from '../../ecs/entities/platforms';
import { createSeesaw } from '../../ecs/entities/seesaw';
import { createTestBall } from '../../ecs/entities/test_ball';
import { loadBackground } from '../../backgrounds/index';
import { BaseTestScene } from './BaseTestScene';
import { ZLayer } from '../../ecs/components/index';
import Phaser from 'phaser';

export class PullTest extends BaseTestScene {
    constructor() {
        super('PullTest', 'Pull Test', 'Large starting platform test.');
    }

    create() {
        super.create();

        const WORLD_SIZE = 5000;
        const spawnX = 0;
        const spawnY = (WORLD_SIZE / 2) - 400; // Near the bottom

        this.cameras.main.setBounds(-WORLD_SIZE / 2, -WORLD_SIZE / 2, WORLD_SIZE, WORLD_SIZE);
        this.cameras.main.setZoom(0.8);
        
        // --- LOAD BACKGROUND ---
        loadBackground('complexity', this, { 
            worldWidth: WORLD_SIZE, 
            worldHeight: WORLD_SIZE
        });

        // 0. SPAWN PLATFORM
        const spawnPlat = this.addEntity(createSpawnPlatform(spawnX, spawnY, { 
            width: 2000, 
            height: 200, 
            color: 0x444444 
        }));
        spawnPlat.components.ZLayer = ZLayer('PLAY', 5);

        // 1. SEESAWS
        const seesawLeft = this.addEntity(createSeesaw(-500, spawnY - 500, {
            width: 600,
            mass: 50,
            stiffness: 0,
            maxRotation: 0.8
        }));

        const seesawRight = this.addEntity(createSeesaw(500, spawnY - 500, {
            width: 600,
            mass: 50,
            stiffness: 2.5,
            maxRotation: 0.8
        }));

        const seesawTop = this.addEntity(createSeesaw(0, spawnY - 1000, {
            width: 800,
            mass: 50,
            stiffness: 0,
            maxRotation: 0
        }));

        // 2. TEST BALLS
        // On Main Platform
        this.addEntity(createTestBall(-800, spawnY - 150));
        this.addEntity(createTestBall(800, spawnY - 150));
        
        // On Seesaws
        this.addEntity(createTestBall(-600, spawnY - 600));
        this.addEntity(createTestBall(600, spawnY - 600));
        this.addEntity(createTestBall(0, spawnY - 1100));

        // 3. PLAYER
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
