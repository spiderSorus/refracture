import { spawnPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform } from '../../ecs/entities/platforms';
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

        spawnPlayer(this, spawnPlat);
        
        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
