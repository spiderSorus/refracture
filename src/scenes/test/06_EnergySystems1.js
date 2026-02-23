// src/scenes/test/06_EnergySystems1.js
import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    SpawnTag, RealityLevel, MeditationState, Mass, Velocity, Ego
} from '../../ecs/components/index';
import Phaser from 'phaser';

export class EnergySystems1 extends BaseTestScene {
    constructor() {
        super('EnergySystems1', 'Energy Systems 1', 'Ego Transfer Test (255 -> 10).');
        this.meditationEnabled = false;
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
            RealityLevel([0], [0]),
            EntityType('PLATFORM'),
            Mass(10),
            Renderable({ 'BASE': { type: 'rect', width: 100, height: 20, color: 0x00ff00 } }),
            Collider('rect', 0, 100, 20)
        ]);

        // 2. BIG PLATFORM (Ego 255, Moved closer: 600 -> 350)
        this.addEntity([
            Position(centerX - 350, centerY),
            Velocity(0, 0),
            PlatformTag(),
            RealityLevel([0], [0]),
            EntityType('PLATFORM'),
            Ego(255),
            Mass(10),
            Renderable({ 'BASE': { type: 'circle', radius: 255 * 0.8 + 20, color: 0xffffff } }),
            Collider('circle', 255 * 0.8 + 20)
        ]);

        // 3. SMALL PLATFORM (Ego 10, Moved closer: 600 -> 350)
        this.addEntity([
            Position(centerX + 350, centerY),
            Velocity(0, 0),
            PlatformTag(),
            RealityLevel([0], [0]),
            EntityType('PLATFORM'),
            Ego(10),
            Mass(2),
            Renderable({ 'BASE': { type: 'circle', radius: 10 * 0.8 + 20, color: 0xffffff } }),
            Collider('circle', 10 * 0.8 + 20)
        ]);

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            SlingshotJump(3500),
            RealityLevel([0], [0])
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
