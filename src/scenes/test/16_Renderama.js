import { createPlayer, spawnPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform, createPlatform } from '../../ecs/entities/platforms';
import { loadBackground } from '../../backgrounds/index';
import { BaseTestScene } from './BaseTestScene';
import { PHYSICS } from '../../core/Constants';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    Mass, Velocity, ZLayer, Rotation, GravityExempt
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
        
        // Define dynamic camera configuration
        this.cameraConfigs = [
            { name: 'BackgroundWC', layer: 'bg_watercolor', effect: 'watercolor', type: 'BACK' },
            { name: 'BackgroundOldGlass', layer: 'bg_glass', effect: 'old_glass', type: 'BACK' },
            { name: 'ForegroundRainbow', layer: 'fg_rainbow', effect: 'rainbow', type: 'FORE' },
            { name: 'PlayerCamera', layer: 'player_layer', type: 'TOP' } // Renders on top
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
        spawnPlat.components.ZLayer = ZLayer('FORE', 5, 'fg_rainbow');

        // 1. GENERATE CLIMBING PLATFORMS (from VerticalSlice)
        let lastPos = { x: spawnX, y: spawnY };
        for (let i = 0; i < 150; i++) { // Increased count for the larger world
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const dist = Phaser.Math.Between(600, 1200);
            let nextX = lastPos.x + Math.cos(angle) * dist;
            let nextY = lastPos.y + Math.sin(angle) * dist;
            
            // Stay within world bounds
            nextX = Phaser.Math.Clamp(nextX, -WORLD_WIDTH / 2 + 500, WORLD_WIDTH / 2 - 500);
            nextY = Phaser.Math.Clamp(nextY, -WORLD_HEIGHT / 2 + 500, WORLD_HEIGHT / 2 - 500);

            const isCircle = Math.random() > 0.4;
            const size = Phaser.Math.Between(80, 180);
            const color = Phaser.Display.Color.RandomRGB(40).color;
            
            const vx = Phaser.Math.Between(-100, 100);
            const vy = Phaser.Math.Between(-100, 100);

            const components = [
                Position(nextX, nextY), 
                Velocity(vx, vy),
                Mass(10),
                GravityExempt(),
                PlatformTag(), 
                EntityType('PLATFORM'),
                ZLayer('FORE', 10, 'fg_rainbow'),
                Renderable({ 'BASE': { type: 'amorphous_blob', radius: size, color: color } }),
                Collider('circle', size * 0.6) // Collider is smaller than the visual blob
            ];
            
            this.addEntity(components);
            lastPos = { x: nextX, y: nextY };
        }
        
        // 2. PLAYER
        spawnPlayer(this, spawnPlat);
        
        this.cameras.main.centerOn(spawnX, spawnY);
    }

    fixedUpdate(time, dt) {
        const player = this.entities.find(e => e.components.PlayerTag && !e.toDestroy);
        if (player) {
            // Assign player to their own layer to be rendered by the top camera
            player.components.ZLayer = ZLayer('PLAY', 0, 'player_layer');
        }
    }
}
