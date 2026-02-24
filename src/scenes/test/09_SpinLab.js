// src/scenes/test/09_SpinLab.js
import { createPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform } from '../../ecs/entities/platforms';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    Mass, Velocity, Spin, Rotation, StaticTag
} from '../../ecs/components/index';
import Phaser from 'phaser';

export class SpinLab extends BaseTestScene {
    constructor() {
        super('SpinLab', 'Spin Lab', 'Static and Floater Spinners.');
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

        const spawnX = centerX;
        const spawnY = -WORLD_HEIGHT / 2;

        // 0. SPAWN PLATFORM
        this.addEntity(createSpawnPlatform(spawnX, spawnY));

        // 2. STATIC SQUARE SPINNER
        this.addEntity([
            Position(centerX - 250, centerY),
            Rotation(0),
            Spin(Math.PI / 4), 
            PlatformTag(),
            StaticTag(),
            EntityType('PLATFORM'),
            Mass(10),
            Renderable({ 'BASE': { type: 'rect', width: 300, height: 300, color: 0xff00ff } }),
            Collider('rect', 0, 300, 300)
        ]);

        // 3. FLOATER SQUARE SPINNER
        this.addEntity([
            Position(centerX + 250, centerY),
            Rotation(0),
            Velocity(0, 0),
            Spin(-Math.PI / 6), 
            PlatformTag(),
            EntityType('PLATFORM'),
            Mass(5),
            Renderable({ 'BASE': { type: 'rect', width: 300, height: 300, color: 0x00ffff } }),
            Collider('rect', 0, 300, 300)
        ]);

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            SlingshotJump(3500)
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
