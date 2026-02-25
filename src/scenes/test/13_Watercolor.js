import { createPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform } from '../../ecs/entities/platforms';
import { createCathedralColumn } from '../../ecs/entities/backgrounds/cathedral';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    Mass, Velocity, ViewLayers, ZLayer
} from '../../ecs/components/index';
import Phaser from 'phaser';

export class WatercolorScene extends BaseTestScene {
    constructor() {
        super('WatercolorScene', 'Cathedral of Red', 'Complex parallax layering.');
    }

    create() {
        super.create();

        const WORLD_SIZE = 8000;
        this.cameras.main.setBounds(-WORLD_SIZE / 2, -WORLD_SIZE / 2, WORLD_SIZE, WORLD_SIZE);
        this.cameras.main.setZoom(0.8);
        this.cameras.main.setPostPipeline('AquarellePipeline');
        
        // --- 5-LAYER PARALLAX + Z-LAYER SYSTEM ---
        const layers = [
            { parallax: 0.1, zIndex: 40, count: 80,  w: [20, 50], h: [400, 1000], alpha: 0.1, color: [20, 50] },   // DEEP BACK
            { parallax: 0.3, zIndex: 30, count: 100, w: [30, 60], h: [300, 800],  alpha: 0.2, color: [40, 80] },   // FAR
            { parallax: 0.5, zIndex: 20, count: 120, w: [40, 80], h: [200, 600],  alpha: 0.4, color: [60, 120] },  // MID
            { parallax: 0.7, zIndex: 10, count: 100, w: [50, 100],h: [150, 500],  alpha: 0.6, color: [100, 180] }, // NEAR
            { parallax: 1.0, zIndex: 0,  count: 20,  w: [100, 200],h: [800, 2000], alpha: 0.3, color: [150, 200] }  // LAYER 0 (No Relative Parallax)
        ];

        layers.forEach(l => {
            for (let i = 0; i < l.count; i++) {
                const x = Phaser.Math.Between(-WORLD_SIZE / 2, WORLD_SIZE / 2);
                const y = Phaser.Math.Between(-WORLD_SIZE / 2, WORLD_SIZE / 2);
                
                const r = Phaser.Math.Between(l.color[0], l.color[1]);
                const color = Phaser.Display.Color.GetColor(r, 5, 5);

                this.addEntity(createCathedralColumn(x, y, {
                    width: Phaser.Math.Between(l.w[0], l.w[1]),
                    height: Phaser.Math.Between(l.h[0], l.h[1]),
                    color: color,
                    alpha: l.alpha,
                    parallax: l.parallax,
                    zType: 'BACK',
                    zIndex: l.zIndex
                }));
            }
        });

        const spawnX = 0;
        const spawnY = 0;

        // 0. SPAWN PLATFORM
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

    fixedUpdate(time, dt) { }
}
