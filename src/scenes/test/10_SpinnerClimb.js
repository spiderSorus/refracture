// src/scenes/test/10_SpinnerClimb.js
import { createPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform } from '../../ecs/entities/platforms';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    Mass, Velocity, Spin, Rotation, StaticTag
} from '../../ecs/components/index';
import Phaser from 'phaser';

export class SpinnerClimb extends BaseTestScene {
    constructor() {
        super('SpinnerClimb', 'Spinner Climb', 'Ascend the rotating platforms.');
        this.meditationEnabled = false;
    }

    create() {
        super.create();

        const WORLD_WIDTH = 3000;
        const WORLD_HEIGHT = 12000;
        this.cameras.main.setBounds(0, -WORLD_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(0.5);

        if (!this.textures.exists('bg_grid')) {
            const gfx = this.make.graphics({ x: 0, y: 0, add: false });
            gfx.lineStyle(2, 0x1a1a1a, 1);
            gfx.strokeRect(0, 0, 100, 100);
            gfx.generateTexture('bg_grid', 100, 100);
        }
        const grid = this.add.tileSprite(WORLD_WIDTH / 2, -WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 'bg_grid').setDepth(0);
        if (this.bgLayer) this.bgLayer.add(grid);

        const spawnX = WORLD_WIDTH / 2;
        const spawnY = -WORLD_HEIGHT / 2;

        // 0. SPAWN PLATFORM
        this.addEntity(createSpawnPlatform(spawnX, spawnY));

        // 2. PROCEDURAL SPINNER PATH
        let lastY = spawnY;
        for (let i = 0; i < 50; i++) {
            const dist = Phaser.Math.Between(400, 900);
            const nextY = lastY - dist;
            const nextX = Phaser.Math.Between(400, WORLD_WIDTH - 400);
            const isCircle = Math.random() > 0.4;
            const size = Phaser.Math.Between(70, 160);
            const spinRate = Phaser.Math.FloatBetween(0.3, 2.0) * (Math.random() > 0.5 ? 1 : -1);
            const color = Phaser.Display.Color.RandomRGB(40).color;

            const comps = [
                Position(nextX, nextY),
                Rotation(Math.random() * Math.PI * 2),
                Spin(spinRate),
                PlatformTag(),
                StaticTag(), 
                EntityType('PLATFORM'),
                Mass(size / 40)
            ];

            if (isCircle) {
                comps.push(Renderable({ 'BASE': { type: 'circle', radius: size, color: color } }));
                comps.push(Collider('circle', size));
            } else {
                const w = size * 2.2; const h = Phaser.Math.Between(30, 80);
                comps.push(Renderable({ 'BASE': { type: 'rect', width: w, height: h, color: color } }));
                comps.push(Collider('rect', 0, w, h));
            }
            this.addEntity(comps);
            lastY = nextY;
        }

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            SlingshotJump(3500)
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
