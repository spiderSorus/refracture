// src/scenes/test/12_PlayerTest.js
import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    SpawnTag, Mass, Velocity
} from '../../ecs/components/index';
import Phaser from 'phaser';

export class PlayerTest extends BaseTestScene {
    constructor() {
        super('PlayerTest', 'Player Test', 'A small 700x700 sandbox.');
        this.meditationEnabled = false;
    }

    create() {
        super.create();

        const WORLD_SIZE = 2000;
        this.cameras.main.setBounds(-WORLD_SIZE/2, -WORLD_SIZE/2, WORLD_SIZE, WORLD_SIZE);
        this.cameras.main.setZoom(0.8);

        if (!this.textures.exists('bg_grid')) {
            const gfx = this.make.graphics({ x: 0, y: 0, add: false });
            gfx.lineStyle(2, 0x1a1a1a, 1);
            gfx.strokeRect(0, 0, 100, 100);
            gfx.generateTexture('bg_grid', 100, 100);
        }
        this.add.tileSprite(0, 0, WORLD_SIZE, WORLD_SIZE, 'bg_grid').setDepth(0);

        // Visual Borders
        const borderGfx = this.add.graphics();
        borderGfx.lineStyle(4, 0xffffff, 1);
        borderGfx.strokeRect(-WORLD_SIZE/2, -WORLD_SIZE/2, WORLD_SIZE, WORLD_SIZE);

        const spawnX = 0;
        const spawnY = 0;

        // 1. SPAWN PLATFORM
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

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            SlingshotJump(3500)
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
