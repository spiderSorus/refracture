// src/scenes/test/06_EnergySystems1.js
import { createPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform } from '../../ecs/entities/platforms';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    Mass, Velocity, Ego
} from '../../ecs/components/index';
import { WebActivationRule, FloaterGravityRule, EgoBalanceRule } from '../../ecs/systems/energy_logic/Rules';
import Phaser from 'phaser';

export class EnergySystems1 extends BaseTestScene {
    constructor() {
        super('EnergySystems1', 'Energy Systems 1', 'Ego Transfer Test (255 -> 10).');
        this.meditationEnabled = false;
        this.energyRules = [WebActivationRule, FloaterGravityRule, EgoBalanceRule];
    }

    create() {
        super.create();

        const WORLD_WIDTH = 4000;
        const WORLD_HEIGHT = 4000;
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

        const centerX = WORLD_WIDTH / 2;
        const centerY = -WORLD_HEIGHT / 2;

        const spawnX = centerX;
        const spawnY = -WORLD_HEIGHT / 2;

        // 0. SPAWN PLATFORM
        this.addEntity(createSpawnPlatform(spawnX, spawnY));

        // 2. BIG PLATFORM (Ego 255, Orange)
        this.addEntity([
            Position(centerX - 350, centerY),
            Velocity(0, 0),
            PlatformTag(),
            EntityType('PLATFORM'),
            Ego(255),
            Mass(10),
            Renderable({ 'BASE': { type: 'circle', radius: 255 * 0.8 + 20, color: 0xffa500 } }),
            Collider('circle', 255 * 0.8 + 20)
        ]);

        // 3. SMALL PLATFORM (Ego 10, Purple)
        this.addEntity([
            Position(centerX + 350, centerY),
            Velocity(0, 0),
            PlatformTag(),
            EntityType('PLATFORM'),
            Ego(10),
            Mass(2),
            Renderable({ 'BASE': { type: 'circle', radius: 10 * 0.8 + 20, color: 0x800080 } }),
            Collider('circle', 10 * 0.8 + 20)
        ]);

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            SlingshotJump(3500)
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
