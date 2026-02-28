import { spawnPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform } from '../../ecs/entities/platforms';
import { createStem } from '../../ecs/entities/stem';
import { loadBackground } from '../../backgrounds/index';
import { BaseTestScene } from './BaseTestScene';
import { ZLayer } from '../../ecs/components/index';

export class PlantsScene extends BaseTestScene {
    constructor() {
        super('PlantsScene', 'PLANTS', 'Plant system and growth lab.');
    }

    create() {
        super.create();

        const WORLD_SIZE = 5000;
        const spawnX = 0;
        const spawnY = (WORLD_SIZE / 2) - 400;

        this.cameras.main.setBounds(-WORLD_SIZE / 2, -WORLD_SIZE / 2, WORLD_SIZE, WORLD_SIZE);
        this.cameras.main.setZoom(0.8);
        
        loadBackground('watercolor', this, { 
            worldWidth: WORLD_SIZE, 
            worldHeight: WORLD_SIZE
        });

        const spawnPlat = this.addEntity(createSpawnPlatform(spawnX, spawnY, { 
            width: 2000, 
            height: 200, 
            color: 0x224422 // Dark green for plants theme
        }));
        spawnPlat.components.ZLayer = ZLayer('PLAY', 5);

        // Four stems with different stiffness levels
        // 25% stiffness
        this.addEntity(createStem(spawnX - 600, spawnY - 100, {
            length: 500,
            thickness: 30,
            stiffness: 0.25,
            color: 0x228B22
        }));

        // 33% stiffness
        this.addEntity(createStem(spawnX - 200, spawnY - 100, {
            length: 500,
            thickness: 30,
            stiffness: 0.33,
            color: 0x32CD32
        }));

        // 50% stiffness
        this.addEntity(createStem(spawnX + 200, spawnY - 100, {
            length: 500,
            thickness: 30,
            stiffness: 0.50,
            color: 0x228B22
        }));

        // 75% stiffness
        this.addEntity(createStem(spawnX + 600, spawnY - 100, {
            length: 500,
            thickness: 30,
            stiffness: 0.75,
            color: 0x006400
        }));

        spawnPlayer(this, spawnPlat);
        
        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
