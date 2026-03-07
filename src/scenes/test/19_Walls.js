import { createPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform } from '../../ecs/entities/platforms';
import { createWall } from '../../ecs/entities/wall';
import { BaseTestScene } from './BaseTestScene';
import { PHYSICS } from '../../core/Constants';
import { SlingshotJump, ZLayer } from '../../ecs/components/index';

export class WallsTest extends BaseTestScene {
    constructor() {
        super('WallsTest', 'Walls Test', 'Bounce off the glowing walls.');
    }

    create() {
        super.create();

        const WORLD_WIDTH = 3000;
        const WORLD_HEIGHT = 10000;
        this.cameras.main.setBounds(0, -WORLD_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(0.8);

        const spawnX = WORLD_WIDTH / 2;
        const spawnY = -500;

        // Reset Spawn Platform Size
        const areaWidth = 800;
        const areaHeight = 600;

        // 0. SPAWN PLATFORM
        this.addEntity([
            ...createSpawnPlatform(spawnX, spawnY, { width: 200, height: 40 }),
            ZLayer('PLAY', 5)
        ]);

        // Define an area with four walls centered around the spawn point
        const wallThickness = 100;
        const centerX = spawnX;
        const centerY = -500;

        // Top wall
        this.addEntity(createWall(centerX, centerY - areaHeight/2, areaWidth, wallThickness, 0));
        // Bottom wall
        this.addEntity(createWall(centerX, centerY + areaHeight/2, areaWidth, wallThickness, 0));
        // Left wall
        this.addEntity(createWall(centerX - areaWidth/2, centerY, wallThickness, areaHeight, 0));
        // Right wall
        this.addEntity(createWall(centerX + areaWidth/2, centerY, wallThickness, areaHeight, 0));

        // Angled wall inside for fun
        this.addEntity(createWall(centerX + 200, centerY - 100, 200, 30, Math.PI / 4));

        // Player (needed for BaseTestScene to perform re-attachment)
        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            SlingshotJump(PHYSICS.SLINGSHOT_FORCE),
            ZLayer('PLAY', 0)
        ]);

        this.cameras.main.centerOn(centerX, centerY);
    }
}
