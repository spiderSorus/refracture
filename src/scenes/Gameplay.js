import { createPlayer } from '../ecs/entities/player';
import { createSpawnPlatform, createPlatform } from '../ecs/entities/platforms';
import { BaseTestScene } from './test/BaseTestScene';
import { loadBackground } from '../backgrounds/index';
import { PHYSICS } from '../core/Constants';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump, ZLayer,
    Velocity, Mass, GravityExempt, Ego
} from '../ecs/components/index';
import Phaser from 'phaser';

export class Gameplay extends BaseTestScene {
    constructor() {
        super('Gameplay', 'Gameplay', 'Climb to the summit.');
        this.meditationEnabled = false;
    }

    create() {
        super.create();

        this.enableEnergyRule('EgoBalance');
        this.enableEnergyRule('WebActivation');

        const WORLD_WIDTH = 3000;
        const WORLD_HEIGHT = 10000;
        this.cameras.main.setBounds(0, -WORLD_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(0.6);

        // --- LOAD BACKGROUND ---
        loadBackground('watercolor', this, { 
            worldWidth: WORLD_WIDTH, 
            worldHeight: WORLD_HEIGHT 
        });

        const spawnX = WORLD_WIDTH / 2;
        const spawnY = -100; // 100 over the floor (maxY is 0)

        // 0. SPAWN PLATFORM
        const spawnPlatComps = createSpawnPlatform(spawnX, spawnY, { width: 400, height: 100 });
        const spawnRend = spawnPlatComps.find(c => c._type === 'Renderable');
        if (spawnRend && spawnRend.definitions['BASE']) {
            spawnRend.definitions['BASE'].type = 'lsd';
            spawnRend.definitions['BASE'].lsdSpeed = 0.02;
        }
        this.addEntity(spawnPlatComps);

        // 1. GRID OF PLATFORMS
        const gridCols = 5;
        const gridRows = 20;
        const spacingX = 500;
        const spacingY = -400; // Moving upwards

        for (let r = 1; r <= gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
                const px = spawnX - ((gridCols - 1) * spacingX) / 2 + (c * spacingX);
                const py = spawnY + (r * spacingY);
                
                // Randomly vary position slightly
                const ox = (Math.random() - 0.5) * 100;
                const oy = (Math.random() - 0.5) * 50;

                const egoVal = Phaser.Math.Between(0, 255);
                const colorVal = 0x888888;

                const platformComponents = createPlatform(px + ox, py + oy, { 
                    width: 150, 
                    height: 60, 
                    isStatic: true,
                    color: colorVal 
                });

                // Apply LSD Effect to all platforms
                const rend = platformComponents.find(c => c._type === 'Renderable');
                if (rend && rend.definitions['BASE']) {
                    rend.definitions['BASE'].type = 'lsd';
                    rend.definitions['BASE'].lsdSpeed = 0.02; 
                }

                const platform = this.addEntity([
                    ...platformComponents,
                    Ego(egoVal),
                    ZLayer('PLAY', 10)
                ]);
            }
        }

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            SlingshotJump(PHYSICS.SLINGSHOT_FORCE),
            ZLayer('PLAY', 0)
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
