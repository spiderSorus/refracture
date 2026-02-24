// src/scenes/test/05_EnergySystems0.js
import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    SpawnTag, Mass, Velocity, Ego
} from '../../ecs/components/index';
import { FloaterGravityRule, EgoBalanceRule } from '../../ecs/systems/energy_logic/Rules';
import Phaser from 'phaser';

export class EnergySystems0 extends BaseTestScene {
    constructor() {
        super('EnergySystems0', 'Energy Systems 0', 'Modular Energy Logic (Floater Gravity + Balance).');
        this.meditationEnabled = false;
        this.energyRules = [FloaterGravityRule, EgoBalanceRule];
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

        this.add.tileSprite(WORLD_WIDTH / 2, -WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 'bg_grid').setDepth(0);

        const borderGfx = this.add.graphics();
        borderGfx.lineStyle(10, 0xffffff, 1);
        borderGfx.strokeRect(0, -WORLD_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT);

        const centerX = WORLD_WIDTH / 2;
        const centerY = -WORLD_HEIGHT / 2;

        // 1. SPAWN PLATFORM
        const spawnX = centerX;
        const spawnY = -150;
        this.addEntity([
            Position(spawnX, spawnY),
            Velocity(0, 0),
            PlatformTag(),
            SpawnTag(),
            EntityType('PLATFORM'),
            Mass(10),
            Renderable({ 'BASE': { type: 'rect', width: 100, height: 20, color: 0x00ff00 } }),
            Collider('rect', 0, 100, 20)
        ]);

        // 2. LEFT PLATFORM (Cyan, Ego 128)
        this.addEntity([
            Position(centerX - 300, centerY),
            Velocity(0, 0),
            PlatformTag(),
            EntityType('PLATFORM'),
            Ego(128),
            Mass(5),
            Renderable({ 'BASE': { type: 'circle', radius: 128 * 0.8 + 20, color: 0x00ffff } }),
            Collider('circle', 128 * 0.8 + 20)
        ]);

        // 3. RIGHT PLATFORM (Yellow, Ego 128)
        this.addEntity([
            Position(centerX + 300, centerY),
            Velocity(0, 0),
            PlatformTag(),
            EntityType('PLATFORM'),
            Ego(128),
            Mass(5),
            Renderable({ 'BASE': { type: 'circle', radius: 128 * 0.8 + 20, color: 0xffff00 } }),
            Collider('circle', 128 * 0.8 + 20)
        ]);

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            SlingshotJump(3500)
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
