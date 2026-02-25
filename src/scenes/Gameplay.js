import { createPlayer } from '../ecs/entities/player';
import { createSpawnPlatform, createPlatform } from '../ecs/entities/platforms';
import { BaseTestScene } from './test/BaseTestScene';
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
        const spawnY = -100; // 100 over the floor (maxY is 0)

        // 0. SPAWN PLATFORM
        this.addEntity(createSpawnPlatform(spawnX, spawnY, { width: 400, height: 100 }));

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
                const colorVal = Phaser.Display.Color.GetColor(egoVal, egoVal, egoVal);

                const platformComponents = createPlatform(px + ox, py + oy, { 
                    width: 150, 
                    height: 60, 
                    isStatic: true,
                    color: colorVal 
                });

                const platform = this.addEntity([
                    ...platformComponents,
                    Ego(egoVal)
                ]);
            }
        }

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            SlingshotJump(PHYSICS.SLINGSHOT_FORCE)
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
