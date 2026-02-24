// src/scenes/test/08_EnergySystems3.js
import { createPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform } from '../../ecs/entities/platforms';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    Mass, Velocity, Ego
} from '../../ecs/components/index';
import { DynamicStaticToggleRule, EgoBalanceRule } from '../../ecs/systems/energy_logic/Rules';
import Phaser from 'phaser';

export class EnergySystems3 extends BaseTestScene {
    constructor() {
        super('EnergySystems3', 'Energy Systems 3', 'High-Density Ego/Toggle Lab.');
        this.meditationEnabled = false;
        this.energyRules = [DynamicStaticToggleRule, EgoBalanceRule];
    }

    create() {
        super.create();

        const WORLD_WIDTH = 4000;
        const WORLD_HEIGHT = 8000;
        this.cameras.main.setBounds(0, -WORLD_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(0.5);

        if (!this.textures.exists('bg_grid')) {
            const gfx = this.make.graphics({ x: 0, y: 0, add: false });
            gfx.lineStyle(2, 0x1a1a1a, 1);
            gfx.strokeRect(0, 0, 100, 100);
            gfx.generateTexture('bg_grid', 100, 100);
        }
        this.add.tileSprite(WORLD_WIDTH / 2, -WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 'bg_grid').setDepth(0);

        const spawnX = WORLD_WIDTH / 2;
        const spawnY = -WORLD_HEIGHT / 2;

        // 0. SPAWN PLATFORM
        this.addEntity(createSpawnPlatform(spawnX, spawnY));

        // 2. 60 RANDOM EGO FLOATERS
        for (let i = 0; i < 60; i++) {
            const fx = Phaser.Math.Between(500, WORLD_WIDTH - 500);
            const fy = Phaser.Math.Between(-WORLD_HEIGHT + 500, -500);
            const egoVal = Phaser.Math.Between(10, 255);
            const mass = egoVal / 50; 
            const color = Phaser.Display.Color.HSLToColor(egoVal / 255, 0.6, 0.5).color;

            this.addEntity([
                Position(fx, fy),
                Velocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50)),
                PlatformTag(),
                EntityType('PLATFORM'),
                Ego(egoVal),
                Mass(mass),
                Renderable({ 'BASE': { type: 'circle', radius: egoVal * 0.8 + 20, color: color } }),
                Collider('circle', egoVal * 0.8 + 20)
            ]);
        }

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            SlingshotJump(3500)
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
