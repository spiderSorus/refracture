// src/scenes/test/03_GameplaySlice.js
import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    Velocity, BugTag, BugAI, GravityExempt, Mass, SpawnTag, RealityLevel
} from '../../ecs/components/index';
import Phaser from 'phaser';

export class GameplaySlice extends BaseTestScene {
    constructor() {
        super('GameplaySlice', 'Gameplay Slice', 'Full vertical mechanics test.');
        this.meditationEnabled = false;
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

        const bg = this.add.tileSprite(WORLD_WIDTH / 2, -WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 'bg_grid');
        bg.setDepth(0);

        const floorGfx = this.add.graphics();
        floorGfx.lineStyle(10, 0x00ff00, 1);
        floorGfx.lineBetween(0, 5, WORLD_WIDTH, 5);

        // --- 0. SPAWN PLATFORM ---
        const spawnX = WORLD_WIDTH / 2;
        const spawnY = -150;
        this.addEntity([
            Position(spawnX, spawnY),
            PlatformTag(),
            SpawnTag(),
            RealityLevel([0], [0]),
            EntityType('PLATFORM'),
            Mass(10),
            Renderable({ 'BASE': { type: 'circle', radius: 50, color: 0x00ff00 } }),
            Collider('circle', 50)
        ]);

        // --- 1. CENTER FLOATER ---
        this.addEntity([
            Position(WORLD_WIDTH / 2, -WORLD_HEIGHT / 2),
            PlatformTag(),
            GravityExempt(),
            RealityLevel([0], [0]),
            Mass(5),
            EntityType('PLATFORM'),
            Renderable({ 'BASE': { type: 'circle', radius: 120, color: 0xff00ff } }),
            Collider('circle', 120)
        ]);

        // --- 2. SPAWN FLOATERS ---
        const platformCount = 60;
        const margin = 200;
        for (let i = 0; i < platformCount; i++) {
            const fx = Phaser.Math.Between(margin, WORLD_WIDTH - margin);
            const fy = Phaser.Math.Between(-WORLD_HEIGHT + margin, -200);
            
            const size = Phaser.Math.Between(80, 220);
            const color = Phaser.Display.Color.RandomRGB(40).color;
            const mass = size / 40;

            this.addEntity([
                Position(fx, fy),
                Velocity(Phaser.Math.Between(-80, 80), Phaser.Math.Between(-80, 80)),
                PlatformTag(),
                GravityExempt(),
                RealityLevel([0], [0]),
                Mass(mass),
                EntityType('PLATFORM'),
                Renderable({ 'BASE': { type: 'circle', radius: size, color: color } }),
                Collider('circle', size)
            ]);
        }

        // --- 3. SPAWN BUGS ---
        for (let i = 0; i < 150; i++) {
            const bx = Phaser.Math.Between(0, WORLD_WIDTH);
            const by = Phaser.Math.Between(-WORLD_HEIGHT, -100);
            this.addEntity([
                Position(bx, by),
                Velocity(0, 0),
                BugTag(),
                RealityLevel([0], [0]),
                GravityExempt(),
                BugAI(),
                Renderable({
                    'BASE': { type: 'circle', radius: 6, color: 0xffff00 }
                })
            ]);
        }

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            SlingshotJump(3500),
            RealityLevel([0], [0])
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
